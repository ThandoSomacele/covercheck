import { DB_CONNECTION_STRING, OPENROUTER_API_KEY } from '$env/static/private';
import { getSimplificationPromptSA } from '$lib/insurance/insurance-glossary-sa';
import { Ollama } from 'ollama';
import OpenAI from 'openai';
import pg from 'pg';

const { Client } = pg;

/**
 * Search result from vector database
 */
interface SearchResult {
  content: string;
  documentTitle: string;
  documentUrl: string;
  provider: string;
  similarity: number;
}

/**
 * RAG response with citations
 */
export interface RAGResponse {
  response: string;
  sources: Array<{
    title: string;
    url: string;
    provider: string;
    relevance: number;
  }>;
}

/**
 * Semantic search using vector similarity
 */
export async function semanticSearch(
  query: string,
  limit: number = 5,
  providerFilter?: string
): Promise<SearchResult[]> {
  const ollama = new Ollama();
  const db = new Client({ connectionString: DB_CONNECTION_STRING });

  try {
    await db.connect();

    // Generate embedding for the query
    const response = await ollama.embeddings({
      model: 'nomic-embed-text',
      prompt: query,
    });

    const queryEmbedding = response.embedding;

    // Build SQL query with optional provider filter
    let sql = `
			SELECT
				content,
				document_title,
				document_url,
				provider,
				1 - (embedding <=> $1::vector) AS similarity
			FROM document_chunks
			WHERE embedding IS NOT NULL
		`;

    const params: any[] = [JSON.stringify(queryEmbedding)];

    if (providerFilter) {
      sql += ` AND provider = $${params.length + 1}`;
      params.push(providerFilter);
    }

    sql += `
			ORDER BY embedding <=> $1::vector
			LIMIT $${params.length + 1}
		`;
    params.push(limit);

    const result = await db.query(sql, params);

    return result.rows.map(row => ({
      content: row.content,
      documentTitle: row.document_title,
      documentUrl: row.document_url,
      provider: row.provider,
      similarity: parseFloat(row.similarity),
    }));
  } finally {
    await db.end();
  }
}

/**
 * Query insurance using RAG with semantic search and cloud LLM
 */
export async function queryInsurance(question: string, providerFilter?: string): Promise<RAGResponse> {
  // Perform semantic search
  const relevantChunks = await semanticSearch(question, 5, providerFilter);

  if (relevantChunks.length === 0) {
    return {
      response:
        "I couldn't find information about that in our medical aid documents. Can you rephrase your question or ask about a specific plan?",
      sources: [],
    };
  }

  // Build context from search results
  const context = relevantChunks
    .map(
      (chunk, i) =>
        `[Source ${i + 1}: ${chunk.documentTitle} - ${chunk.provider}]
${chunk.content}`
    )
    .join('\n\n---\n\n');

  // Get simplification prompt
  const simplificationPrompt = getSimplificationPromptSA();

  // Create prompt with citations
  const prompt = `${simplificationPrompt}

MEDICAL AID DOCUMENTS TO USE:
${context}

USER'S QUESTION: ${question}

IMPORTANT: When answering, cite your sources by mentioning the source number (e.g., "According to Source 1..." or "As stated in Source 2..."). This helps users verify the information.

YOUR ANSWER (Remember: Use SA English, Rands, and medical aid terminology):`;

  // Initialize OpenRouter client (compatible with OpenAI SDK)
  const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: OPENROUTER_API_KEY,
    defaultHeaders: {
      'HTTP-Referer': 'https://covercheck.co.za', // Optional: your site URL
      'X-Title': 'CoverCheck', // Optional: site title
    },
  });

  // Try each model until one works (fallback strategy for rate limits)
  let responseText = '';
  let lastError: any = null;

  for (const model of FREE_MODELS) {
    try {
      // Query OpenRouter with current model
      const completion = await openrouter.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      responseText = completion.choices[0]?.message?.content || 'No response generated.';
      break; // Success! Exit the loop
    } catch (error: any) {
      lastError = error;

      // If it's an authentication error, provide helpful message
      if (error.status === 401) {
        console.error('OpenRouter authentication failed. Please check your API key.');
        responseText =
          "I'm sorry, but the service is currently experiencing configuration issues. Please try again later or contact support.";
        break;
      }

      // If it's a rate limit error, try the next model
      if (error.status === 429) {
        console.log(`Model ${model} is rate-limited, trying next model...`);
        continue;
      }

      // For other errors, throw immediately
      throw error;
    }
  }

  // If all models failed due to rate limits
  if (!responseText && lastError?.status === 429) {
    responseText = "I'm experiencing high demand right now. Please try again in a moment.";
  }

  // Build sources array with unique documents
  const sourcesMap = new Map<string, { title: string; url: string; provider: string; relevance: number }>();

  relevantChunks.forEach(chunk => {
    const key = chunk.documentUrl;
    if (!sourcesMap.has(key) || sourcesMap.get(key)!.relevance < chunk.similarity) {
      sourcesMap.set(key, {
        title: chunk.documentTitle,
        url: chunk.documentUrl,
        provider: chunk.provider,
        relevance: chunk.similarity,
      });
    }
  });

  return {
    response: responseText,
    sources: Array.from(sourcesMap.values()).sort((a, b) => b.relevance - a.relevance),
  };
}

/**
 * Available free models in priority order
 * Try each one until we find one that's not rate-limited
 */
const FREE_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.1-8b-instruct',
  'mistralai/mistral-7b-instruct:free',
  'google/gemini-flash-1.5:free',
];

/**
 * Query insurance with streaming response
 * Returns an async generator that yields response chunks
 */
export async function* queryInsuranceStream(
  question: string,
  providerFilter?: string
): AsyncGenerator<{ type: 'sources' | 'chunk' | 'done'; data: any }> {
  // Perform semantic search
  const relevantChunks = await semanticSearch(question, 5, providerFilter);

  if (relevantChunks.length === 0) {
    yield {
      type: 'chunk',
      data: "I couldn't find information about that in our medical aid documents. Can you rephrase your question or ask about a specific plan?",
    };
    yield { type: 'done', data: null };
    return;
  }

  // Build sources array with unique documents, maintaining order for citation mapping
  const sourcesMap = new Map<
    string,
    { title: string; url: string; provider: string; relevance: number; firstIndex: number }
  >();

  relevantChunks.forEach((chunk, index) => {
    const key = chunk.documentUrl;
    if (!sourcesMap.has(key)) {
      sourcesMap.set(key, {
        title: chunk.documentTitle,
        url: chunk.documentUrl,
        provider: chunk.provider,
        relevance: chunk.similarity,
        firstIndex: index,
      });
    }
  });

  // Sort by first appearance to maintain logical citation order
  const sources = Array.from(sourcesMap.values())
    .sort((a, b) => a.firstIndex - b.firstIndex)
    .map(({ firstIndex, ...source }) => source);

  // Create a mapping from chunk index to source index for the AI context
  const chunkToSourceMap = new Map<number, number>();
  relevantChunks.forEach((chunk, chunkIndex) => {
    const sourceIndex = sources.findIndex(s => s.url === chunk.documentUrl);
    chunkToSourceMap.set(chunkIndex, sourceIndex);
  });

  // Send sources first
  yield {
    type: 'sources',
    data: sources,
  };

  // Build context from search results with correct source numbering
  const context = relevantChunks
    .map((chunk, i) => {
      const sourceNum = chunkToSourceMap.get(i)! + 1;
      return `[Source ${sourceNum}: ${chunk.documentTitle} - ${chunk.provider}]
${chunk.content}`;
    })
    .join('\n\n---\n\n');

  // Get simplification prompt
  const simplificationPrompt = getSimplificationPromptSA();

  // Create prompt with citations
  const prompt = `${simplificationPrompt}

MEDICAL AID DOCUMENTS TO USE:
${context}

USER'S QUESTION: ${question}

IMPORTANT: When answering, cite your sources by mentioning the source number (e.g., "According to Source 1..." or "As stated in Source 2..."). This helps users verify the information.

YOUR ANSWER (Remember: Use SA English, Rands, and medical aid terminology):`;

  // Initialize OpenRouter client
  const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: OPENROUTER_API_KEY,
    defaultHeaders: {
      'HTTP-Referer': 'https://covercheck.co.za',
      'X-Title': 'CoverCheck',
    },
  });

  // Try each model until one works (fallback strategy for rate limits)
  let lastError: any = null;

  for (const model of FREE_MODELS) {
    try {
      // Stream the response
      const stream = await openrouter.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      });

      // Yield each chunk as it arrives
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield {
            type: 'chunk',
            data: content,
          };
        }
      }

      // Signal completion
      yield {
        type: 'done',
        data: null,
      };

      // Success! Exit the loop
      return;
    } catch (error: any) {
      lastError = error;

      // If it's an authentication error, provide helpful message
      if (error.status === 401) {
        console.error('OpenRouter authentication failed. Please check your API key.');
        yield {
          type: 'chunk',
          data: "I'm sorry, but the service is currently experiencing configuration issues. Please try again later or contact support.",
        };
        yield {
          type: 'done',
          data: null,
        };
        return;
      }

      // If it's a rate limit error, try the next model
      if (error.status === 429) {
        console.log(`Model ${model} is rate-limited, trying next model...`);
        continue;
      }

      // For other errors, throw immediately
      throw error;
    }
  }

  // If we get here, all models failed
  console.error('All models failed:', lastError);
  yield {
    type: 'chunk',
    data: "I'm experiencing high demand right now. Please try again in a few moments.",
  };
  yield {
    type: 'done',
    data: null,
  };
}

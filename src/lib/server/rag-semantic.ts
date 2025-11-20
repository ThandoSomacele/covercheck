import { DB_CONNECTION_STRING, OPENROUTER_API_KEY } from '$env/static/private';
import { getSimplificationPromptSA } from '$lib/insurance/insurance-glossary-sa';
import { getEmbeddingProvider } from './embedding-service';
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
 * Expand query with relevant medical aid terminology for better semantic matching
 */
function expandQuery(query: string): string {
  const expansions: { [key: string]: string[] } = {
    // Pregnancy and maternity
    pregnant: ['pregnancy', 'maternity', 'antenatal', 'prenatal', 'obstetric', 'expecting', 'baby'],
    pregnancy: ['pregnant', 'maternity', 'antenatal', 'prenatal', 'obstetric', 'expecting', 'baby'],
    baby: ['newborn', 'infant', 'child', 'birth', 'delivery', 'maternity', 'paediatric'],
    birth: ['delivery', 'labour', 'childbirth', 'maternity', 'obstetric', 'caesarean', 'natural birth'],

    // Medical procedures and surgery
    surgery: ['operation', 'procedure', 'surgical', 'theatre', 'hospital', 'hospitalisation', 'admission', 'in-hospital', 'ward', 'theatre fees', 'surgeon', 'anaesthetist'],
    operation: ['surgery', 'procedure', 'surgical', 'hospital', 'hospitalisation', 'admission', 'theatre'],
    procedure: ['surgery', 'operation', 'surgical', 'hospital', 'treatment', 'medical procedure'],
    surgical: ['surgery', 'operation', 'procedure', 'hospital', 'theatre'],

    // Coverage and benefits
    cover: ['coverage', 'benefit', 'included', 'pay for', 'pays for', 'paid'],
    benefits: ['coverage', 'cover', 'included', 'entitlement', 'benefit'],

    // Payment and costs
    'co-payment': ['copayment', 'co-pay', 'out-of-pocket', 'deductible', 'levy'],
    claim: ['claims', 'reimbursement', 'paid', 'payment', 'invoice'],

    // Hospital and facilities
    hospital: ['hospitalisation', 'admission', 'ward', 'facility', 'in-hospital', 'inpatient', 'surgery', 'operation', 'theatre'],
    hospitalisation: ['hospital', 'admission', 'ward', 'inpatient', 'hospital stay'],
    admission: ['hospitalisation', 'hospital', 'admitted', 'inpatient', 'ward'],
    doctor: ['GP', 'physician', 'specialist', 'practitioner', 'medical practitioner', 'consultation'],
    specialist: ['doctor', 'physician', 'consultant', 'referral', 'specialised care'],

    // Chronic conditions
    chronic: ['chronic condition', 'chronic disease list', 'CDL', 'long-term condition', 'ongoing treatment'],
    diabetes: ['chronic', 'CDL', 'chronic medication', 'blood sugar', 'glucose'],

    // Prescribed Minimum Benefits
    pmb: ['prescribed minimum benefits', 'PMB', 'minimum benefits', 'emergency', 'chronic disease list'],

    // Emergency
    emergency: ['casualty', 'trauma', 'urgent', 'acute', 'ambulance'],
    casualty: ['emergency', 'trauma', 'urgent care', 'accident', 'ER'],
    accident: ['emergency', 'casualty', 'trauma', 'injury', 'urgent'],
  };

  let expandedQuery = query.toLowerCase();

  // Add related terms to the query
  for (const [term, relatedTerms] of Object.entries(expansions)) {
    if (expandedQuery.includes(term)) {
      expandedQuery += ' ' + relatedTerms.join(' ');
    }
  }

  return expandedQuery;
}

/**
 * Detect provider mentioned in query
 */
function detectProviderInQuery(query: string): string | null {
  const lowerQuery = query.toLowerCase();

  // Check for explicit provider mentions
  if (/(discovery|discovery health)/i.test(lowerQuery)) {
    return 'Discovery Health Medical Scheme';
  }
  if (/(bonitas|bonitas medical)/i.test(lowerQuery)) {
    return 'Bonitas Medical Fund';
  }
  if (/(momentum|momentum health)/i.test(lowerQuery)) {
    return 'Momentum Health';
  }

  // Check for plan-specific mentions that indicate provider
  if (/(keycare|comprehensive series|saver series|smart series|executive|classic|essential)/i.test(lowerQuery)) {
    return 'Discovery Health Medical Scheme';
  }
  if (/(bonsave|bonfit|bonessential|bonprime|boncap|bonstart)/i.test(lowerQuery)) {
    return 'Bonitas Medical Fund';
  }

  return null;
}

/**
 * Detect query intent and extract relevant keywords
 */
function detectQueryIntent(query: string): { intent: string; keywords: string[] } {
  const lowerQuery = query.toLowerCase();

  // Pregnancy/maternity intent
  if (/(pregnan|maternit|baby|birth|newborn|expecting|antenatal|prenatal|obstetric)/i.test(lowerQuery)) {
    return {
      intent: 'pregnancy_maternity',
      keywords: ['pregnancy', 'maternity', 'antenatal', 'prenatal', 'obstetric', 'baby', 'newborn', 'birth', 'delivery']
    };
  }

  // Chronic condition intent
  if (/(chronic|long.?term|ongoing|manage)/i.test(lowerQuery)) {
    return {
      intent: 'chronic_condition',
      keywords: ['chronic', 'chronic condition', 'CDL', 'long-term', 'medication', 'management']
    };
  }

  // Emergency intent
  if (/(emergency|urgent|casualt|trauma|accident)/i.test(lowerQuery)) {
    return {
      intent: 'emergency',
      keywords: ['emergency', 'casualty', 'trauma', 'urgent', 'accident', 'acute']
    };
  }

  // Hospital/procedure intent
  if (/(hospital|surgery|operation|procedure|admission)/i.test(lowerQuery)) {
    return {
      intent: 'hospital_procedure',
      keywords: ['hospital', 'hospitalisation', 'surgery', 'operation', 'procedure', 'admission', 'ward']
    };
  }

  // General coverage/benefits
  return {
    intent: 'general_coverage',
    keywords: []
  };
}

/**
 * Re-rank search results based on query intent and keyword matching
 */
function reRankResults(results: SearchResult[], query: string): SearchResult[] {
  const { intent, keywords } = detectQueryIntent(query);

  // If no specific intent or no keywords, return as-is
  if (intent === 'general_coverage' || keywords.length === 0) {
    return results;
  }

  // Calculate boost score based on keyword presence in content
  return results.map(result => {
    let boostScore = 0;
    const contentLower = result.content.toLowerCase();

    keywords.forEach(keyword => {
      if (contentLower.includes(keyword.toLowerCase())) {
        boostScore += 0.1; // Add 0.1 for each matching keyword
      }
    });

    // Apply boost to similarity score (cap at 1.0)
    const boostedSimilarity = Math.min(1.0, result.similarity + boostScore);

    return {
      ...result,
      similarity: boostedSimilarity
    };
  }).sort((a, b) => b.similarity - a.similarity);
}

/**
 * Semantic search using vector similarity with query expansion and re-ranking
 */
export async function semanticSearch(
  query: string,
  limit: number = 5,
  providerFilter?: string
): Promise<SearchResult[]> {
  const db = new Client({ connectionString: DB_CONNECTION_STRING });

  try {
    await db.connect();

    // Expand query with related terms for better semantic matching
    const expandedQuery = expandQuery(query);

    // Generate embedding for the expanded query
    let queryEmbedding;
    try {
      const provider = getEmbeddingProvider();
      queryEmbedding = await provider.generateEmbedding(expandedQuery);
      console.log(`Using ${provider.getName()} for embeddings`);
    } catch (error: any) {
      console.error('Embedding generation error:', error.message);

      // Check if it's a Hugging Face API downtime (502/503 errors)
      if (error.message.includes('502') || error.message.includes('503') || error.message.includes('Bad Gateway')) {
        throw new Error('🔧 We\'re experiencing temporary technical difficulties with our search service. Please try again in a few minutes. We apologize for the inconvenience!');
      }

      // Check if it's a rate limit (429)
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        throw new Error('⏰ We\'ve received a lot of queries recently! Please wait a moment and try again.');
      }

      // Generic error for other cases
      throw new Error('Unable to generate embeddings. Please check your embedding provider configuration.');
    }

    // Retrieve more results than needed (we'll re-rank and filter)
    const retrieveLimit = limit * 3;

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
    params.push(retrieveLimit);

    const result = await db.query(sql, params);

    const searchResults = result.rows.map(row => ({
      content: row.content,
      documentTitle: row.document_title,
      documentUrl: row.document_url,
      provider: row.provider,
      similarity: parseFloat(row.similarity),
    }));

    // Re-rank based on query intent and keyword matching
    const reRankedResults = reRankResults(searchResults, query);

    // Return top results after re-ranking
    return reRankedResults.slice(0, limit);
  } finally {
    await db.end();
  }
}

/**
 * Query insurance using RAG with semantic search and cloud LLM
 */
export async function queryInsurance(question: string, providerFilter?: string): Promise<RAGResponse> {
  // Auto-detect provider from query if not specified
  const detectedProvider = detectProviderInQuery(question);
  const effectiveProvider = providerFilter || detectedProvider || undefined;

  // Perform semantic search with effective provider
  const relevantChunks = await semanticSearch(question, 5, effectiveProvider);

  if (relevantChunks.length === 0) {
    return {
      response:
        "I couldn't find information about that in our medical aid documents. Can you rephrase your question or ask about a specific plan?",
      sources: [],
    };
  }

  // Build sources array with unique documents
  const sourcesMap = new Map<string, { title: string; url: string; provider: string; relevance: number; firstIndex: number }>();

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

  // Create a mapping from chunk index to source index
  const chunkToSourceMap = new Map<number, number>();
  relevantChunks.forEach((chunk, chunkIndex) => {
    const sourceIndex = sources.findIndex(s => s.url === chunk.documentUrl);
    chunkToSourceMap.set(chunkIndex, sourceIndex);
  });

  // Build context from search results with proper source references
  const context = relevantChunks
    .map((chunk, i) => {
      const sourceNum = chunkToSourceMap.get(i)! + 1;
      const source = sources[sourceNum - 1];
      return `[Source ${sourceNum}: ${source.title} (${source.provider})]
${chunk.content}`;
    })
    .join('\n\n---\n\n');

  // Get simplification prompt
  const simplificationPrompt = getSimplificationPromptSA();

  // Detect query intent to provide context-specific instructions
  const { intent } = detectQueryIntent(question);
  let specificInstructions = '';

  if (intent === 'pregnancy_maternity') {
    specificInstructions = `
CONTEXT: This question is about pregnancy, maternity, or baby-related benefits.
- Focus on maternity benefits, antenatal care, delivery, postnatal care, and newborn coverage
- Include specific details like covered tests, scans, visits, and hospitalization
- Mention any waiting periods, limits, or co-payments
- If discussing plan changes, focus on benefits that matter for pregnancy`;
  } else if (intent === 'chronic_condition') {
    specificInstructions = `
CONTEXT: This question is about chronic conditions or long-term care.
- Focus on Chronic Disease List (CDL), prescribed minimum benefits (PMBs)
- Include details about medication coverage, monitoring, and specialist visits`;
  } else if (intent === 'emergency') {
    specificInstructions = `
CONTEXT: This question is about emergency or urgent care.
- Focus on casualty coverage, trauma units, emergency admissions
- Include details about ambulance services and emergency procedures`;
  }

  // Determine if we have multi-provider results
  const uniqueProviders = new Set(sources.map(s => s.provider));
  const isMultiProvider = uniqueProviders.size > 1;

  // Add provider-specific guidance
  let providerGuidance = '';
  if (effectiveProvider) {
    providerGuidance = `\nNOTE: The user has specified or implied ${effectiveProvider}. Focus your answer on this provider's plans.`;
  } else if (isMultiProvider) {
    providerGuidance = `\nMULTI-PROVIDER RESPONSE STRATEGY:
- The user has NOT specified a medical aid provider
- You have documents from multiple providers (${Array.from(uniqueProviders).join(', ')})
- Provide a COMPARATIVE answer highlighting key differences between providers
- Structure: "Generally, [common aspect]. However, [provider A] offers [X], while [provider B] offers [Y]"
- Keep it concise - max 2-3 providers comparison
- End with: "For the most accurate information for your specific plan, please let me know which medical aid provider you're with."`;
  }

  // Create prompt with citations
  const prompt = `${simplificationPrompt}

MEDICAL AID DOCUMENTS TO USE:
${context}
${specificInstructions}
${providerGuidance}

USER'S QUESTION: ${question}

CRITICAL CITATION INSTRUCTIONS:
- ALWAYS cite sources by their full name, e.g., "According to the Discovery Health Comprehensive Plan" or "As stated in the Bonitas BonEssential plan"
- NEVER use generic references like "Source 1" or just "🔗"
- Include the provider name when mentioning a plan, e.g., "Discovery Health's Executive Plan" or "Bonitas Standard Select"
- Be specific about which plan you're referencing: "The KeyCare Plus plan from Discovery Health covers..."

YOUR ANSWER (Remember: Use SA English, Rands, cite plans by their full names):`;

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

  return {
    response: responseText,
    sources: sources,
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
  // Auto-detect provider from query if not specified
  const detectedProvider = detectProviderInQuery(question);
  const effectiveProvider = providerFilter || detectedProvider || undefined;

  // Perform semantic search with effective provider
  const relevantChunks = await semanticSearch(question, 5, effectiveProvider);

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

  // Build context from search results with proper source references
  const context = relevantChunks
    .map((chunk, i) => {
      const sourceNum = chunkToSourceMap.get(i)! + 1;
      const source = sources[sourceNum - 1];
      return `[Source ${sourceNum}: ${source.title} (${source.provider})]
${chunk.content}`;
    })
    .join('\n\n---\n\n');

  // Get simplification prompt
  const simplificationPrompt = getSimplificationPromptSA();

  // Detect query intent to provide context-specific instructions
  const { intent } = detectQueryIntent(question);
  let specificInstructions = '';

  if (intent === 'pregnancy_maternity') {
    specificInstructions = `
CONTEXT: This question is about pregnancy, maternity, or baby-related benefits.
- Focus on maternity benefits, antenatal care, delivery, postnatal care, and newborn coverage
- Include specific details like covered tests, scans, visits, and hospitalization
- Mention any waiting periods, limits, or co-payments
- If discussing plan changes, focus on benefits that matter for pregnancy`;
  } else if (intent === 'chronic_condition') {
    specificInstructions = `
CONTEXT: This question is about chronic conditions or long-term care.
- Focus on Chronic Disease List (CDL), prescribed minimum benefits (PMBs)
- Include details about medication coverage, monitoring, and specialist visits`;
  } else if (intent === 'emergency') {
    specificInstructions = `
CONTEXT: This question is about emergency or urgent care.
- Focus on casualty coverage, trauma units, emergency admissions
- Include details about ambulance services and emergency procedures`;
  }

  // Determine if we have multi-provider results
  const uniqueProviders = new Set(sources.map(s => s.provider));
  const isMultiProvider = uniqueProviders.size > 1;

  // Add provider-specific guidance
  let providerGuidance = '';
  if (effectiveProvider) {
    providerGuidance = `\nNOTE: The user has specified or implied ${effectiveProvider}. Focus your answer on this provider's plans.`;
  } else if (isMultiProvider) {
    providerGuidance = `\nMULTI-PROVIDER RESPONSE STRATEGY:
- The user has NOT specified a medical aid provider
- You have documents from multiple providers (${Array.from(uniqueProviders).join(', ')})
- Provide a COMPARATIVE answer highlighting key differences between providers
- Structure: "Generally, [common aspect]. However, [provider A] offers [X], while [provider B] offers [Y]"
- Keep it concise - max 2-3 providers comparison
- End with: "For the most accurate information for your specific plan, please let me know which medical aid provider you're with."`;
  }

  // Create prompt with citations
  const prompt = `${simplificationPrompt}

MEDICAL AID DOCUMENTS TO USE:
${context}
${specificInstructions}
${providerGuidance}

USER'S QUESTION: ${question}

CRITICAL CITATION INSTRUCTIONS:
- ALWAYS cite sources by their full name, e.g., "According to the Discovery Health Comprehensive Plan" or "As stated in the Bonitas BonEssential plan"
- NEVER use generic references like "Source 1" or just "🔗"
- Include the provider name when mentioning a plan, e.g., "Discovery Health's Executive Plan" or "Bonitas Standard Select"
- Be specific about which plan you're referencing: "The KeyCare Plus plan from Discovery Health covers..."

YOUR ANSWER (Remember: Use SA English, Rands, cite plans by their full names):`;

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

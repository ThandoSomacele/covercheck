import { json } from "@sveltejs/kit";
import OpenAI from "openai";
import { Ollama } from "ollama";
import pg from "pg";
function getSimplificationPromptSA() {
  return `
You are a medical aid assistant for South Africans. Answer questions clearly using the provided documents.

LANGUAGE REQUIREMENTS:
- Use South African/British English (hospitalisation, centre, not center)
- Use Rands (R) not dollars ($)
- Use "medical aid" or "medical scheme" not just "insurance"
- Use SA terms: GP, casualty (not ER), network hospitals, gap cover, PMBs

RULES:
1. Answer directly and concisely
2. Use plain language - avoid jargon unless explaining it
3. Include specific Rand amounts from the documents
4. If you use medical aid terms (co-payment, gap cover, PMBs, etc.), briefly explain them in brackets
5. Focus on answering what was asked - don't provide unsolicited advice
6. Reference SA context where relevant (Netcare, Life Healthcare, etc.)

ANSWER FORMAT:
- Start with the direct answer
- Include relevant costs in Rands
- Only explain terms if you used them
- Be brief and specific

Answer based ONLY on the provided documents below.
`;
}
const DB_CONNECTION_STRING = "postgresql://postgres.dlwldjpjqdgzvfvwajnr:CNGiUm8G3a0cIk@aws-1-us-east-2.pooler.supabase.com:6543/postgres";
const OPENROUTER_API_KEY = "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";
const { Client } = pg;
async function semanticSearch(query, limit = 5, providerFilter) {
  const ollama = new Ollama();
  const db = new Client({ connectionString: DB_CONNECTION_STRING });
  try {
    await db.connect();
    const response = await ollama.embeddings({
      model: "nomic-embed-text",
      prompt: query
    });
    const queryEmbedding = response.embedding;
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
    const params = [JSON.stringify(queryEmbedding)];
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
    return result.rows.map((row) => ({
      content: row.content,
      documentTitle: row.document_title,
      documentUrl: row.document_url,
      provider: row.provider,
      similarity: parseFloat(row.similarity)
    }));
  } finally {
    await db.end();
  }
}
const FREE_MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "google/gemini-flash-1.5:free"
];
async function* queryInsuranceStream(question, providerFilter) {
  const relevantChunks = await semanticSearch(question, 5, providerFilter);
  const sourcesMap = /* @__PURE__ */ new Map();
  relevantChunks.forEach((chunk) => {
    const key = chunk.documentUrl;
    if (!sourcesMap.has(key) || sourcesMap.get(key).relevance < chunk.similarity) {
      sourcesMap.set(key, {
        title: chunk.documentTitle,
        url: chunk.documentUrl,
        provider: chunk.provider,
        relevance: chunk.similarity
      });
    }
  });
  const sources = Array.from(sourcesMap.values()).sort((a, b) => b.relevance - a.relevance);
  yield {
    type: "sources",
    data: sources
  };
  if (relevantChunks.length === 0) {
    yield {
      type: "chunk",
      data: "I couldn't find information about that in our medical aid documents. Can you rephrase your question or ask about a specific plan?"
    };
    yield { type: "done", data: null };
    return;
  }
  const context = relevantChunks.map(
    (chunk, i) => `[Source ${i + 1}: ${chunk.documentTitle} - ${chunk.provider}]
${chunk.content}`
  ).join("\n\n---\n\n");
  const simplificationPrompt = getSimplificationPromptSA();
  const prompt = `${simplificationPrompt}

MEDICAL AID DOCUMENTS TO USE:
${context}

USER'S QUESTION: ${question}

IMPORTANT: When answering, cite your sources by mentioning the source number (e.g., "According to Source 1..." or "As stated in Source 2..."). This helps users verify the information.

YOUR ANSWER (Remember: Use SA English, Rands, and medical aid terminology):`;
  const openrouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": "https://covercheck.co.za",
      "X-Title": "CoverCheck"
    }
  });
  let lastError = null;
  for (const model of FREE_MODELS) {
    try {
      const stream = await openrouter.chat.completions.create({
        model,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1e3,
        stream: true
      });
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield {
            type: "chunk",
            data: content
          };
        }
      }
      yield {
        type: "done",
        data: null
      };
      return;
    } catch (error) {
      lastError = error;
      if (error.status === 429) {
        console.log(`Model ${model} is rate-limited, trying next model...`);
        continue;
      }
      throw error;
    }
  }
  console.error("All models failed:", lastError);
  yield {
    type: "chunk",
    data: "I'm experiencing high demand right now. Please try again in a moment, or consider adding your own API key for guaranteed access."
  };
  yield {
    type: "done",
    data: null
  };
}
const POST = async ({ request }) => {
  try {
    const { message, provider } = await request.json();
    if (!message) {
      return json({ error: "Message is required" }, { status: 400 });
    }
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of queryInsuranceStream(message, provider)) {
            const data = JSON.stringify(chunk) + "\n";
            controller.enqueue(encoder.encode(data));
          }
        } catch (error) {
          console.error("Streaming error:", error);
          const errorChunk = JSON.stringify({
            type: "error",
            data: "An error occurred while processing your request"
          }) + "\n";
          controller.enqueue(encoder.encode(errorChunk));
        } finally {
          controller.close();
        }
      }
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (error) {
    console.error("Error:", error);
    return json({ error: "An error occurred while processing your request" }, { status: 500 });
  }
};
export {
  POST
};

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
const OPENROUTER_API_KEY = "your_openrouter_api_key_here";
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
async function queryInsurance(question, providerFilter) {
  const relevantChunks = await semanticSearch(question, 5, providerFilter);
  if (relevantChunks.length === 0) {
    return {
      response: "I couldn't find information about that in our medical aid documents. Can you rephrase your question or ask about a specific plan?",
      sources: []
    };
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
      // Optional: your site URL
      "X-Title": "CoverCheck"
      // Optional: site title
    }
  });
  const completion = await openrouter.chat.completions.create({
    model: "meta-llama/llama-3.2-3b-instruct:free",
    // Free tier model
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1e3
  });
  const responseText = completion.choices[0]?.message?.content || "No response generated.";
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
  return {
    response: responseText,
    sources: Array.from(sourcesMap.values()).sort((a, b) => b.relevance - a.relevance)
  };
}
const POST = async ({ request }) => {
  try {
    const { message, provider } = await request.json();
    if (!message) {
      return json({ error: "Message is required" }, { status: 400 });
    }
    const result = await queryInsurance(message, provider);
    return json(result);
  } catch (error) {
    console.error("Error:", error);
    return json({ error: "An error occurred while processing your request" }, { status: 500 });
  }
};
export {
  POST
};

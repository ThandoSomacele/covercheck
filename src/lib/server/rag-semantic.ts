import OpenAI from 'openai';
import { Ollama } from 'ollama';
import pg from 'pg';
import { getSimplificationPromptSA } from '$lib/insurance/insurance-glossary-sa';
import { DB_CONNECTION_STRING, OPENROUTER_API_KEY } from '$env/static/private';

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
			prompt: query
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

/**
 * Query insurance using RAG with semantic search and cloud LLM
 */
export async function queryInsurance(
	question: string,
	providerFilter?: string
): Promise<RAGResponse> {
	// Perform semantic search
	const relevantChunks = await semanticSearch(question, 5, providerFilter);

	if (relevantChunks.length === 0) {
		return {
			response:
				"I couldn't find information about that in our medical aid documents. Can you rephrase your question or ask about a specific plan?",
			sources: []
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
			'X-Title': 'CoverCheck' // Optional: site title
		}
	});

	// Query OpenRouter with a cost-effective model
	const completion = await openrouter.chat.completions.create({
		model: 'meta-llama/llama-3.2-3b-instruct:free', // Free tier model
		messages: [
			{
				role: 'user',
				content: prompt
			}
		],
		temperature: 0.7,
		max_tokens: 1000
	});

	const responseText = completion.choices[0]?.message?.content || 'No response generated.';

	// Build sources array with unique documents
	const sourcesMap = new Map<string, { title: string; url: string; provider: string; relevance: number }>();

	relevantChunks.forEach((chunk) => {
		const key = chunk.documentUrl;
		if (!sourcesMap.has(key) || sourcesMap.get(key)!.relevance < chunk.similarity) {
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

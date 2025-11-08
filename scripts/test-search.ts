import { config } from 'dotenv';
import { Ollama } from 'ollama';
import pg from 'pg';

const { Client } = pg;

config();

interface SearchResult {
  content: string;
  documentTitle: string;
  documentUrl: string;
  provider: string;
  similarity: number;
}

async function semanticSearch(query: string, limit: number = 5): Promise<SearchResult[]> {
  const ollama = new Ollama();
  const db = new Client({
    connectionString: process.env.DB_CONNECTION_STRING
  });

  try {
    // Connect to database
    await db.connect();

    // Generate embedding for query
    console.log(`🔍 Searching for: "${query}"\n`);
    console.log('📊 Generating query embedding...');

    const response = await ollama.embeddings({
      model: 'nomic-embed-text',
      prompt: query
    });

    const queryEmbedding = response.embedding;
    console.log(`✅ Generated ${queryEmbedding.length}-dimensional vector\n`);

    // Search for similar chunks using cosine similarity
    console.log('🔎 Searching database...\n');

    const result = await db.query(
      `SELECT
        content,
        document_title,
        document_url,
        provider,
        1 - (embedding <=> $1::vector) AS similarity
      FROM document_chunks
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT $2`,
      [JSON.stringify(queryEmbedding), limit]
    );

    console.log(`📋 Found ${result.rows.length} results:\n`);

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

async function main() {
  console.log('🔬 CoverCheck Semantic Search Test\n');
  console.log('='.repeat(60) + '\n');

  // Test queries
  const queries = [
    'What does chronic illness cover include?',
    'How much does hospital coverage cost?',
    'What are the benefits for maternity?'
  ];

  for (const query of queries) {
    try {
      const results = await semanticSearch(query, 3);

      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.documentTitle} (${result.provider})`);
        console.log(`   Similarity: ${(result.similarity * 100).toFixed(1)}%`);
        console.log(`   URL: ${result.documentUrl}`);
        console.log(`   Preview: ${result.content.substring(0, 150)}...`);
        console.log('');
      });

      console.log('─'.repeat(60) + '\n');

    } catch (error) {
      console.error(`❌ Error searching for "${query}":`, error);
    }
  }

  console.log('✅ Search test complete!\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

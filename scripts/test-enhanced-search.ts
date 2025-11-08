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
    await db.connect();

    console.log(`🔍 Searching for: "${query}"\n`);

    const response = await ollama.embeddings({
      model: 'nomic-embed-text',
      prompt: query
    });

    const queryEmbedding = response.embedding;

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
  console.log('🔬 CoverCheck Enhanced Semantic Search Test\n');
  console.log('Testing with PDF-enriched database\n');
  console.log('='.repeat(70) + '\n');

  const queries = [
    'What chronic conditions are covered by Discovery Health?',
    'How much does maternity cover cost on Bonitas?',
    'What are the hospital benefits for keycare plans?',
    'Compare the day-to-day benefits across different plans'
  ];

  for (const query of queries) {
    try {
      const results = await semanticSearch(query, 5);

      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.documentTitle} (${result.provider})`);
        console.log(`   Similarity: ${(result.similarity * 100).toFixed(1)}%`);
        console.log(`   Preview: ${result.content.substring(0, 200).replace(/\s+/g, ' ')}...`);
        console.log('');
      });

      console.log('─'.repeat(70) + '\n');

    } catch (error) {
      console.error(`❌ Error: ${error}`);
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

import { Ollama } from 'ollama';
import pg from 'pg';
const { Client } = pg;

const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || '';

async function testSimpleQuery() {
  console.log('🔍 Testing Basic Semantic Search Query\n');
  console.log('=' .repeat(60) + '\n');

  const ollama = new Ollama();
  const db = new Client({ connectionString: DB_CONNECTION_STRING });

  try {
    await db.connect();
    console.log('✅ Connected to database\n');

    // Test 1: Check what's in the database
    const statsResult = await db.query(`
      SELECT provider, COUNT(*) as doc_count
      FROM documents
      GROUP BY provider
      ORDER BY doc_count DESC
    `);

    console.log('📊 Documents in Database:');
    statsResult.rows.forEach(row => {
      console.log(`   ${row.provider}: ${row.doc_count} documents`);
    });

    const chunksResult = await db.query(`
      SELECT provider, COUNT(*) as chunk_count
      FROM document_chunks
      WHERE embedding IS NOT NULL
      GROUP BY provider
      ORDER BY chunk_count DESC
    `);

    console.log('\n📦 Chunks with Embeddings:');
    chunksResult.rows.forEach(row => {
      console.log(`   ${row.provider}: ${row.chunk_count} chunks`);
    });

    // Test 2: Search for maternity content
    console.log('\n' + '=' .repeat(60));
    console.log('\nTEST: Searching for Bonitas maternity information\n');

    const query = 'How much does maternity cover cost on Bonitas?';
    console.log(`Query: "${query}"`);

    // Generate embedding for the query
    const response = await ollama.embeddings({
      model: 'nomic-embed-text',
      prompt: query,
    });

    const queryEmbedding = response.embedding;

    // Search for relevant chunks
    const sql = `
      SELECT
        content,
        document_title,
        document_url,
        provider,
        1 - (embedding <=> $1::vector) AS similarity
      FROM document_chunks
      WHERE embedding IS NOT NULL
        AND provider = 'Bonitas Medical Fund'
      ORDER BY embedding <=> $1::vector
      LIMIT 5
    `;

    const result = await db.query(sql, [JSON.stringify(queryEmbedding)]);

    if (result.rows.length === 0) {
      console.log('\n❌ NO RESULTS FOUND - Maternity query still failing!\n');
    } else {
      console.log(`\n✅ Found ${result.rows.length} relevant chunks:\n`);

      result.rows.forEach((row, i) => {
        console.log(`Result ${i + 1}:`);
        console.log(`  Document: ${row.document_title}`);
        console.log(`  Provider: ${row.provider}`);
        console.log(`  Similarity: ${(parseFloat(row.similarity) * 100).toFixed(2)}%`);
        console.log(`  Content: ${row.content.substring(0, 200).replace(/\n/g, ' ')}...`);
        console.log();
      });
    }

    console.log('=' .repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await db.end();
    console.log('📡 Database connection closed\n');
  }
}

testSimpleQuery()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

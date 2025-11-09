import { config } from 'dotenv';
import pg from 'pg';

const { Client } = pg;
config();

async function checkDatabaseStatus() {
  console.log('📊 Checking Database Status\n');
  console.log('=' .repeat(60) + '\n');

  const connectionString = process.env.DB_CONNECTION_STRING;
  if (!connectionString) {
    console.error('❌ DB_CONNECTION_STRING not found in .env');
    process.exit(1);
  }

  const db = new Client({ connectionString });

  try {
    await db.connect();
    console.log('✅ Connected to database\n');

    // Get total counts
    const docsResult = await db.query('SELECT COUNT(*) FROM documents');
    const chunksResult = await db.query('SELECT COUNT(*) FROM document_chunks');
    const embeddingsResult = await db.query(
      'SELECT COUNT(*) FROM document_chunks WHERE embedding IS NOT NULL'
    );

    console.log('📈 Overall Statistics:');
    console.log(`   Total Documents: ${docsResult.rows[0].count}`);
    console.log(`   Total Chunks: ${chunksResult.rows[0].count}`);
    console.log(`   Chunks with Embeddings: ${embeddingsResult.rows[0].count}`);

    // Get by provider
    const providerResult = await db.query(`
      SELECT
        d.provider,
        COUNT(DISTINCT d.id) as documents,
        COUNT(c.id) as chunks
      FROM documents d
      LEFT JOIN document_chunks c ON d.id = c.document_id
      GROUP BY d.provider
      ORDER BY documents DESC
    `);

    console.log('\n📦 By Provider:');
    for (const row of providerResult.rows) {
      console.log(`\n   ${row.provider}:`);
      console.log(`     Documents: ${row.documents}`);
      console.log(`     Chunks: ${row.chunks}`);
    }

    // Get recent documents
    const recentDocs = await db.query(`
      SELECT title, provider, LENGTH(content) as content_length
      FROM documents
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('\n📝 Recently Added Documents:');
    for (const doc of recentDocs.rows) {
      console.log(`   • ${doc.title.substring(0, 50)}... (${doc.content_length} chars)`);
    }

    console.log('\n' + '=' .repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await db.end();
    console.log('📡 Database connection closed\n');
  }
}

checkDatabaseStatus()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

import { config } from 'dotenv';
import pg from 'pg';

const { Client } = pg;
config();

async function checkMaternityContent() {
  console.log('🔍 Checking Maternity Content Quality\n');
  console.log('='.repeat(60) + '\n');

  const connectionString = process.env.DB_CONNECTION_STRING;
  if (!connectionString) {
    console.error('❌ DB_CONNECTION_STRING not found in .env');
    process.exit(1);
  }

  const db = new Client({ connectionString });

  try {
    await db.connect();
    console.log('✅ Connected to database\n');

    // Get all maternity chunks
    const result = await db.query(`
      SELECT
        chunk_index,
        content,
        LENGTH(content) as content_length
      FROM document_chunks
      WHERE document_title ILIKE '%maternity%'
      ORDER BY chunk_index
    `);

    console.log(`Found ${result.rows.length} maternity chunks:\n`);

    result.rows.forEach((row, i) => {
      console.log(`Chunk ${row.chunk_index + 1}:`);
      console.log(`  Length: ${row.content_length} chars`);
      console.log(`  Content: ${row.content.substring(0, 500).replace(/\s+/g, ' ')}`);
      console.log(`\n${'='.repeat(60)}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await db.end();
    console.log('📡 Database connection closed\n');
  }
}

checkMaternityContent()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

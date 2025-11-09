import { config } from 'dotenv';
import pg from 'pg';

const { Client } = pg;
config();

async function findMissingChunks() {
  console.log('🔍 Finding Documents Without Chunks\n');
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

    // Find documents that have NO chunks
    const result = await db.query(`
      SELECT
        d.id,
        d.title,
        d.provider,
        LENGTH(d.content) as content_length,
        d.content_type
      FROM documents d
      LEFT JOIN document_chunks c ON d.id = c.document_id
      WHERE c.id IS NULL
      ORDER BY d.provider, d.title
    `);

    if (result.rows.length === 0) {
      console.log('✅ All documents have chunks!\n');
    } else {
      console.log(`❌ Found ${result.rows.length} documents WITHOUT chunks:\n`);

      let bonitasCount = 0;
      let discoveryCount = 0;

      result.rows.forEach((row, i) => {
        console.log(`${i + 1}. ${row.title}`);
        console.log(`   ID: ${row.id}`);
        console.log(`   Provider: ${row.provider}`);
        console.log(`   Content: ${row.content_length} chars`);
        console.log(`   Type: ${row.content_type}`);
        console.log();

        if (row.provider === 'Bonitas Medical Fund') bonitasCount++;
        else if (row.provider === 'Discovery Health Medical Scheme') discoveryCount++;
      });

      console.log('=' .repeat(60));
      console.log(`\n📊 Summary:`);
      console.log(`   Bonitas: ${bonitasCount} missing`);
      console.log(`   Discovery: ${discoveryCount} missing`);
      console.log(`   Total: ${result.rows.length} missing\n`);
    }

    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await db.end();
    console.log('📡 Database connection closed\n');
  }
}

findMissingChunks()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

import { config } from 'dotenv';
import pg from 'pg';

const { Client } = pg;
config();

async function clearDatabase() {
  console.log('🗑️  Clearing Database\n');
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

    // Delete all chunks first (foreign key constraint)
    const chunksResult = await db.query('DELETE FROM document_chunks');
    console.log(`🗑️  Deleted ${chunksResult.rowCount} chunks`);

    // Delete all documents
    const docsResult = await db.query('DELETE FROM documents');
    console.log(`🗑️  Deleted ${docsResult.rowCount} documents`);

    console.log('\n✅ Database cleared successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await db.end();
    console.log('📡 Database connection closed\n');
  }
}

clearDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

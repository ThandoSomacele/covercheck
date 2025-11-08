import { readFileSync } from 'fs';
import { join } from 'path';
import pg from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

const { Client } = pg;

async function migrateDatabase() {
  console.log('🔄 Starting database migration...\n');

  const client = new Client({
    connectionString: process.env.DB_CONNECTION_STRING
  });

  try {
    // Connect to database
    console.log('📡 Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read SQL file
    const sqlPath = join(process.cwd(), 'scripts', 'db-setup.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    // Execute migration
    console.log('📝 Running migration SQL...');
    await client.query(sql);
    console.log('✅ Migration completed successfully!\n');

    // Verify tables exist
    console.log('🔍 Verifying tables...');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('documents', 'document_chunks')
      ORDER BY table_name;
    `);

    console.log('📋 Tables found:');
    result.rows.forEach((row) => {
      console.log(`   - ${row.table_name}`);
    });

    // Check vector extension
    console.log('\n🔍 Verifying pgvector extension...');
    const extResult = await client.query(`
      SELECT * FROM pg_extension WHERE extname = 'vector';
    `);

    if (extResult.rows.length > 0) {
      console.log('✅ pgvector extension is installed');
    } else {
      console.log('❌ pgvector extension not found');
    }

    // Show statistics
    console.log('\n📊 Database statistics:');
    const docCount = await client.query('SELECT COUNT(*) FROM documents');
    const chunkCount = await client.query('SELECT COUNT(*) FROM document_chunks');

    console.log(`   Documents: ${docCount.rows[0].count}`);
    console.log(`   Chunks: ${chunkCount.rows[0].count}`);

    console.log('\n✅ Database is ready for Phase 2!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
    console.log('\n📡 Database connection closed');
  }
}

// Run migration
migrateDatabase()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error:', error);
    process.exit(1);
  });

import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { DocumentProcessor, type ScrapedDocument } from '../src/lib/server/document-processor';

config();

async function loadBonitasPDFs() {
  console.log('📚 Loading Bonitas PDF Documents into Database\n');

  // Load the Bonitas PDF scrape data
  const filepath = join(process.cwd(), 'scraped-data', 'bonitas-pdfs-2025-11-08.json');
  const data = JSON.parse(readFileSync(filepath, 'utf-8'));

  console.log('📊 Bonitas PDF data:');
  console.log(`   Total documents: ${data.metadata.totalDocuments}`);
  console.log(`   Provider: ${data.metadata.provider}`);
  console.log(`   Scraped at: ${data.metadata.scrapedAt}\n`);

  // Initialize processor
  const connectionString = process.env.DB_CONNECTION_STRING;
  if (!connectionString) {
    console.error('❌ DB_CONNECTION_STRING not found in .env');
    process.exit(1);
  }

  const processor = new DocumentProcessor(connectionString);

  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    await processor.connect();
    console.log('✅ Connected\n');

    // Process all Bonitas PDF documents
    await processor.processDocuments(data.documents);

    // Show final statistics
    console.log('\n📊 Final Database Statistics:\n');
    const stats = await processor.getStats();

    console.log(`   Total Documents: ${stats.totalDocuments}`);
    console.log(`   Total Chunks: ${stats.totalChunks}`);
    console.log(`   Chunks with Embeddings: ${stats.chunksWithEmbeddings}`);
    console.log('\n   By Provider:');

    for (const [provider, providerData] of Object.entries(stats.byProvider)) {
      console.log(`\n     ${provider}:`);
      console.log(`       Documents: ${providerData.documents}`);
      console.log(`       Chunks: ${providerData.chunks}`);
    }

    console.log('\n✨ Bonitas PDFs loaded successfully!');
    console.log('🔍 Bonitas data is now searchable!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await processor.disconnect();
    console.log('📡 Database connection closed');
  }
}

loadBonitasPDFs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { DocumentProcessor, type ScrapedDocument } from '../src/lib/server/document-processor';

// Load environment variables
config();

async function loadDocuments() {
  console.log('📚 CoverCheck Document Loader\n');
  console.log('Loading scraped documents and processing them for RAG...\n');

  // Find latest scraped data file
  const scrapedDataDir = join(process.cwd(), 'scraped-data');
  const files = readdirSync(scrapedDataDir)
    .filter(f => f.startsWith('scrape-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('❌ No scraped data files found in scraped-data/');
    process.exit(1);
  }

  const latestFile = files[0];
  console.log(`📂 Using: ${latestFile}\n`);

  // Load scraped data
  const filePath = join(scrapedDataDir, latestFile);
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));

  console.log('📊 Scraped data statistics:');
  console.log(`   Total documents: ${data.metadata.statistics.totalDocuments}`);
  console.log(`   Providers: ${data.metadata.statistics.successfulProviders}`);
  console.log(`   Scraped at: ${data.metadata.scrapedAt}\n`);

  for (const [provider, count] of Object.entries(data.metadata.statistics.documentsByProvider)) {
    console.log(`   ${provider}: ${count} documents`);
  }

  // Transform to our document format
  const documents: ScrapedDocument[] = data.documents.map((doc: any) => ({
    id: doc.id,
    title: doc.title,
    content: doc.content,
    url: doc.url,
    contentType: doc.contentType,
    provider: doc.provider,
    scrapedAt: doc.scrapedAt,
    metadata: doc.metadata || {}
  }));

  console.log(`\n✅ Loaded ${documents.length} documents\n`);

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

    // Process all documents
    await processor.processDocuments(documents);

    // Show statistics
    console.log('\n📊 Final Statistics:\n');
    const stats = await processor.getStats();

    console.log(`   Total Documents: ${stats.totalDocuments}`);
    console.log(`   Total Chunks: ${stats.totalChunks}`);
    console.log(`   Chunks with Embeddings: ${stats.chunksWithEmbeddings}`);
    console.log('\n   By Provider:');

    for (const [provider, data] of Object.entries(stats.byProvider)) {
      console.log(`     ${provider}:`);
      console.log(`       Documents: ${data.documents}`);
      console.log(`       Chunks: ${data.chunks}`);
    }

    console.log('\n✨ Document loading complete!');
    console.log('🔍 Your database is now ready for semantic search!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await processor.disconnect();
    console.log('📡 Database connection closed');
  }
}

// Run the loader
loadDocuments()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

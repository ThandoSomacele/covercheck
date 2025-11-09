import { config } from 'dotenv';
import pg from 'pg';
import { DocumentProcessor, type ScrapedDocument } from '../src/lib/server/document-processor';

const { Client } = pg;
config();

async function reprocessMissingChunks() {
  console.log('🔄 Reprocessing Documents Without Chunks\n');
  console.log('='.repeat(60) + '\n');

  const connectionString = process.env.DB_CONNECTION_STRING;
  if (!connectionString) {
    console.error('❌ DB_CONNECTION_STRING not found in .env');
    process.exit(1);
  }

  const db = new Client({ connectionString });
  const processor = new DocumentProcessor(connectionString);

  try {
    await db.connect();
    await processor.connect();
    console.log('✅ Connected to database\n');

    // Find documents without chunks
    const result = await db.query(`
      SELECT
        d.id,
        d.title,
        d.content,
        d.url,
        d.provider,
        d.content_type,
        d.scraped_at,
        d.metadata
      FROM documents d
      LEFT JOIN document_chunks c ON d.id = c.document_id
      WHERE c.id IS NULL
      ORDER BY d.provider, d.title
    `);

    if (result.rows.length === 0) {
      console.log('✅ No documents need reprocessing!\n');
      return;
    }

    console.log(`Found ${result.rows.length} documents to reprocess:\n`);

    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows[i];
      console.log(`${i + 1}/${result.rows.length}: ${row.title}`);
    }

    console.log(`\n${'='.repeat(60)}\n`);
    console.log('🚀 Starting reprocessing...\n');

    // Process each document
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows[i];

      const doc: ScrapedDocument = {
        id: row.id,
        title: row.title,
        content: row.content,
        url: row.url,
        provider: row.provider,
        contentType: row.content_type,
        scrapedAt: row.scraped_at,
        metadata: row.metadata
      };

      try {
        console.log(`\n📄 [${i + 1}/${result.rows.length}] ${doc.title}`);
        console.log(`   Provider: ${doc.provider}`);
        console.log(`   Content: ${doc.content.length} chars`);

        // Chunk the document
        const chunks = processor.chunkDocument(doc);
        console.log(`   📊 Created ${chunks.length} chunks`);

        // Generate embeddings and store chunks
        for (let j = 0; j < chunks.length; j++) {
          const chunk = chunks[j];
          console.log(`   🔄 Processing chunk ${j + 1}/${chunks.length}...`);

          const embedding = await processor.generateEmbedding(chunk.content);
          await processor.storeChunk(chunk, embedding);
        }

        console.log(`   ✅ Completed ${doc.id}`);

      } catch (error) {
        console.error(`   ❌ Failed to process ${doc.id}:`, error);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('\n✅ Reprocessing complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await db.end();
    await processor.disconnect();
    console.log('📡 Database connections closed\n');
  }
}

reprocessMissingChunks()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

import { config } from 'dotenv';
import { DocumentProcessor } from '../src/lib/server/document-processor';

config();

async function checkStats() {
  const connectionString = process.env.DB_CONNECTION_STRING;
  if (!connectionString) {
    console.error('❌ DB_CONNECTION_STRING not found');
    process.exit(1);
  }

  const processor = new DocumentProcessor(connectionString);

  try {
    await processor.connect();
    const stats = await processor.getStats();

    console.log('\n📊 Database Statistics:\n');
    console.log(`   Total Documents: ${stats.totalDocuments}`);
    console.log(`   Total Chunks: ${stats.totalChunks}`);
    console.log(`   Chunks with Embeddings: ${stats.chunksWithEmbeddings}`);
    console.log('\n   By Provider:');

    for (const [provider, data] of Object.entries(stats.byProvider)) {
      console.log(`\n     ${provider}:`);
      console.log(`       Documents: ${data.documents}`);
      console.log(`       Chunks: ${data.chunks}`);
    }

    console.log('\n');

    await processor.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkStats();

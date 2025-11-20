/**
 * Test Hugging Face Embeddings Integration
 * Run: npx tsx scripts/test-hf-embeddings.ts
 */

import { getEmbeddingProvider } from '../src/lib/server/embedding-service.js';

async function testHuggingFace() {
  console.log('🧪 Testing Hugging Face Embeddings...\n');

  try {
    // Set environment to use Hugging Face
    process.env.EMBEDDING_PROVIDER = 'huggingface';

    if (!process.env.HUGGINGFACE_API_KEY) {
      console.error('❌ HUGGINGFACE_API_KEY not found in environment');
      console.log('Please add it to your .env file');
      process.exit(1);
    }

    console.log('✅ Environment configured');
    console.log(`   Provider: ${process.env.EMBEDDING_PROVIDER}`);
    const keyPreview = process.env.HUGGINGFACE_API_KEY.substring(0, 10);
    console.log(`   API Key: ${keyPreview}...`);
    console.log('');

    // Get provider
    const provider = getEmbeddingProvider();
    console.log(`📊 Provider: ${provider.getName()}`);
    console.log(`📐 Dimensions: ${provider.getDimensions()}`);
    console.log('');

    // Test embedding generation
    console.log('🔄 Generating test embedding...');
    const testText = 'What chronic conditions are covered by Discovery Health?';
    console.log(`   Text: "${testText}"`);
    console.log('');

    const startTime = Date.now();
    const embedding = await provider.generateEmbedding(testText);
    const duration = Date.now() - startTime;

    console.log('✅ Embedding generated successfully!');
    console.log(`   Dimensions: ${embedding.length}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    console.log('');

    // Test another embedding
    console.log('🔄 Generating second embedding for comparison...');
    const testText2 = 'How much does maternity cover cost on Bonitas?';
    const embedding2 = await provider.generateEmbedding(testText2);
    console.log('✅ Second embedding generated!');
    console.log('');

    // Calculate similarity
    const dotProduct = embedding.reduce((sum, val, i) => sum + val * embedding2[i], 0);
    const magnitude1 = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0));
    const similarity = dotProduct / (magnitude1 * magnitude2);

    console.log('📊 Similarity Analysis:');
    console.log(`   Cosine similarity: ${similarity.toFixed(4)}`);
    console.log(`   (0 = completely different, 1 = identical)`);
    console.log('');

    console.log('🎉 Hugging Face integration working perfectly!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Regenerate embeddings for your database');
    console.log('2. Test RAG queries');
    console.log('3. Deploy to production!');

  } catch (error: any) {
    console.error('❌ Test failed:');
    console.error(`   ${error.message}`);
    console.error('');

    if (error.message.includes('401')) {
      console.log('💡 Tip: Check your HUGGINGFACE_API_KEY is correct');
      console.log('   Get a new key at: https://huggingface.co/settings/tokens');
    } else if (error.message.includes('loading')) {
      console.log('💡 Tip: Model is loading for the first time (20-30 seconds)');
      console.log('   Wait a moment and try again');
    } else {
      console.error('Full error:', error);
    }
    process.exit(1);
  }
}

testHuggingFace();

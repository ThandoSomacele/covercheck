import { Ollama } from 'ollama';

async function testEmbeddings() {
  const ollama = new Ollama();

  console.log('Testing Ollama nomic-embed-text embeddings...\n');

  const testText = 'What is medical aid coverage for chronic conditions?';

  try {
    const response = await ollama.embeddings({
      model: 'nomic-embed-text',
      prompt: testText
    });

    console.log('✅ Embeddings generated successfully!');
    console.log(`📊 Vector dimensions: ${response.embedding.length}`);
    console.log(`📝 Sample vector (first 10 values):`, response.embedding.slice(0, 10));
    console.log(`\nThis means we need VECTOR(${response.embedding.length}) in PostgreSQL`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEmbeddings();

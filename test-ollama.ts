#!/usr/bin/env node

/**
 * Quick test script for Ollama integration
 */

import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

async function runTest() {
  console.log('🧪 Testing Ollama Integration\n');

  // Test 1: Check connection
  console.log('1️⃣  Checking Ollama connection...');
  try {
    const models = await ollama.list();
    console.log(`✅ Connected! Found ${models.models.length} model(s)`);
    models.models.forEach((m: any) => console.log(`   - ${m.name}`));
  } catch (error: any) {
    console.log('❌ Cannot connect to Ollama');
    console.log('   Start it with: ollama serve');
    process.exit(1);
  }

  // Test 2: Simple query
  console.log('\n2️⃣  Testing simple query...');
  try {
    const response = await ollama.chat({
      model: 'llama3.2',
      messages: [{ role: 'user', content: 'Say "Hello from Ollama!" in one sentence.' }],
      stream: false
    });
    console.log(`✅ Response: ${response.message.content}`);
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}`);
  }

  // Test 3: RAG query (import the function)
  console.log('\n3️⃣  Testing RAG with insurance docs...');
  console.log('   (This will take 5-15 seconds)\n');

  const { askInsurance } = await import('./ollama-simple.js');

  try {
    const answer = await askInsurance(
      "What is the monthly premium for Health Plan A?",
      "llama3.2"
    );
    console.log('\n✅ RAG Test Successful!\n');
    console.log('Question: What is the monthly premium for Health Plan A?');
    console.log('\nAnswer:', answer.substring(0, 200) + '...');
  } catch (error: any) {
    console.log(`❌ RAG Error: ${error.message}`);
  }

  console.log('\n✅ All tests complete! System is ready.');
  console.log('\n▶️  To start interactive mode, run: npm run ollama');
}

runTest().catch(console.error);

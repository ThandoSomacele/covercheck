#!/usr/bin/env node

/**
 * DEMO: Simplified vs. Technical Answers
 *
 * This script shows the difference between regular and simplified explanations.
 * Perfect for demonstrating the value of jargon-free insurance explanations.
 */

import { Ollama } from 'ollama';
import { askInsuranceSimplified } from './ollama-simplified.js';

const ollama = new Ollama({ host: 'http://localhost:11434' });

// Confusing questions real people ask
const confusingQuestions = [
  "What's a deductible and why do I have to pay it?",
  "If I break my arm, what will I actually pay?",
  "What's the difference between Plan A and Plan B?",
  "Can I see any doctor or just specific ones?",
  "What does 'out-of-pocket maximum' mean?",
  "Why is Plan B cheaper? Is it worse?"
];

async function runDemo() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  DEMO: Insurance Simplified                               ║
║  See how we make confusing insurance terms crystal clear  ║
╚═══════════════════════════════════════════════════════════╝
`);

  // Check Ollama connection
  try {
    await ollama.list();
  } catch (error) {
    console.log('❌ Cannot connect to Ollama. Start it with: ollama serve');
    process.exit(1);
  }

  console.log(`
This demo will show how our AI:
1. Answers in SIMPLE language first
2. Explains what you'll actually PAY
3. Defines jargon with analogies
4. Provides technical details for reference

Let's try a confusing question that trips up most people...
`);

  // Pick a challenging question
  const question = "If I break my arm, what will I actually pay?";

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\n❓ QUESTION: "${question}"`);
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log('\nℹ️  This is a common question that confuses people because');
  console.log('   they don\'t understand deductibles, copays, and coverage %.\n');

  console.log('⏳ Getting answer... (this takes 10-20 seconds)\n');

  try {
    const answer = await askInsuranceSimplified(question, 'llama3.2');
    console.log(answer);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log('\n✅ WHAT MAKES THIS ANSWER GREAT:\n');
    console.log('   ✓ Starts with simple language (no jargon)');
    console.log('   ✓ Shows actual dollar amounts');
    console.log('   ✓ Explains terms with analogies');
    console.log('   ✓ Provides technical details at the end');
    console.log('   ✓ User understands without feeling stupid');

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log('\n💡 TRY MORE QUESTIONS:\n');
    console.log('   Run: npm run ollama:simple');
    console.log('\n   Then ask:');
    confusingQuestions.forEach((q, i) => {
      console.log(`   ${i + 1}. "${q}"`);
    });

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  } catch (error: any) {
    console.log(`\n❌ Error: ${error.message}`);
    console.log('\nMake sure you have a model installed:');
    console.log('   ollama pull llama3.2');
  }
}

runDemo().catch(console.error);

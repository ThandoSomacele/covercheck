#!/usr/bin/env node

/**
 * SOUTH AFRICAN MEDICAL AID ASSISTANT
 *
 * Simplified, jargon-free medical aid explanations for South Africans.
 * Uses Rands (R), SA terminology, and local context.
 *
 * Run: npm run sa
 */

import { Ollama } from 'ollama';
import * as readline from 'readline';
import { documentsDB_SA } from './documents-sa.js';
import { getSimplificationPromptSA, medicalAidGlossary } from './insurance-glossary-sa.js';

// Search function
function searchDocuments(query: string, limit: number = 3) {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/);

  const scored = documentsDB_SA.map(doc => {
    const contentLower = (doc.title + ' ' + doc.content).toLowerCase();
    const score = queryTerms.reduce((acc, term) => {
      const matches = (contentLower.match(new RegExp(term, 'g')) || []).length;
      return acc + matches;
    }, 0);

    return { doc, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.doc);
}

// Initialize Ollama
const ollama = new Ollama({ host: 'http://localhost:11434' });

// Main RAG function
async function askMedicalAid(question: string, model: string = 'llama3.1:8b'): Promise<string> {
  console.log('\n🔍 Searching medical aid documents...');

  const relevantDocs = searchDocuments(question, 3);

  if (relevantDocs.length === 0) {
    return "I couldn't find information about that in our medical aid documents. Can you rephrase your question or ask about a specific plan?";
  }

  console.log(`✅ Found ${relevantDocs.length} relevant document(s)`);
  relevantDocs.forEach(doc => console.log(`   - ${doc.title}`));

  const context = relevantDocs.map(doc => `Document: ${doc.title}\n${doc.content}`).join('\n\n---\n\n');

  const simplificationPrompt = getSimplificationPromptSA();

  const prompt = `${simplificationPrompt}

MEDICAL AID DOCUMENTS TO USE:
${context}

USER'S QUESTION: ${question}

YOUR ANSWER (Remember: Simple Rand amounts, SA English, no American terms!):`;

  console.log(`\n🤖 Asking ${model}...\n`);

  try {
    const response = await ollama.chat({
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: false,
    });

    return response.message.content;
  } catch (error: any) {
    if (error.message?.includes('model')) {
      return `❌ Error: Model '${model}' not found. Please run: ollama pull ${model}`;
    }
    throw error;
  }
}

// Interactive CLI
async function runInteractive() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🇿🇦 South African Medical Aid Assistant                   ║
║                                                           ║
║  "Your medical aid and insurance questions                ║
║   answered simply."                                       ║
╚═══════════════════════════════════════════════════════════╝

💬 How this works:
   - Ask ANY question about medical aid in plain English
   - Get a SIMPLE answer first (no confusing terms!)
   - See what it costs in RANDS
   - Understand your cover, co-payments, and benefits

📚 Loaded: ${documentsDB_SA.length} SA medical aid plans
🤖 Using: Ollama (100% private, R0 cost)
📖 Jargon dictionary: ${medicalAidGlossary.length} terms explained
💰 Currency: South African Rands (R)
🇿🇦 Language: South African English

Commands:
  - Type your question naturally
  - 'glossary' - see all medical aid terms explained
  - 'models' - see available AI models
  - 'switch <model>' - change AI model (e.g., 'switch llama3.1')
  - 'exit' - quit

Example questions (ask naturally!):
  - "If I break my arm, what will I pay?"
  - "What's the difference between Plan A and Plan B?"
  - "Do I need gap cover?"
  - "What does 'co-payment' mean?"
  - "Can I see any doctor or must I use network doctors?"
  - "What are PMBs?"
  - "How do I know which plan is better for me?"
`);

  let currentModel = 'llama3.1:8b';

  // Check models
  try {
    const models = await ollama.list();
    const modelNames = models.models.map((m: any) => m.name);

    if (!modelNames.some((m: string) => m.includes('llama3.1:8b'))) {
      if (!modelNames.some((m: string) => m.includes('llama3.1'))) {
        if (modelNames.length > 0) {
          currentModel = modelNames[0].split(':')[0];
          console.log(`ℹ️  Using ${currentModel} (default models not found)\n`);
        } else {
          console.log(`\n❌ No models found!`);
          console.log(`   Install one: ollama pull llama3.1:8b\n`);
          process.exit(1);
        }
      } else {
        currentModel = 'llama3.1';
      }
    }
  } catch (error) {
    console.log(`\n❌ Cannot connect to Ollama.`);
    console.log(`   Start it in another terminal: ollama serve\n`);
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\n❓ Ask me anything: ',
  });

  rl.prompt();

  rl.on('line', async (input: string) => {
    const query = input.trim();

    if (!query) {
      rl.prompt();
      return;
    }

    if (query.toLowerCase() === 'exit') {
      console.log("\n👋 Take care! Medical aid doesn't have to be confusing.");
      process.exit(0);
    }

    if (query.toLowerCase() === 'glossary') {
      console.log('\n📖 MEDICAL AID JARGON DICTIONARY\n');
      console.log('Common medical aid terms explained simply:\n');

      const categories = Array.from(new Set(medicalAidGlossary.map(t => t.category)));
      categories.forEach(cat => {
        console.log(`\n📌 ${cat.toUpperCase().replace(/-/g, ' ')}:`);
        medicalAidGlossary
          .filter(t => t.category === cat)
          .forEach(term => {
            console.log(`\n  • ${term.term}`);
            console.log(`    ${term.simpleExplanation}`);
            if (term.analogy) {
              console.log(`    💡 ${term.analogy}`);
            }
            if (term.example) {
              console.log(`    📝 ${term.example}`);
            }
          });
      });

      rl.prompt();
      return;
    }

    if (query.toLowerCase() === 'models') {
      try {
        const models = await ollama.list();
        console.log('\n📦 Available models:');
        models.models.forEach((m: any) => {
          const isCurrent = m.name.includes(currentModel);
          const size = (m.size / 1_000_000_000).toFixed(1);
          console.log(`   ${isCurrent ? '→' : ' '} ${m.name} (${size}GB)`);
        });
      } catch (error) {
        console.log('❌ Error fetching models');
      }
      rl.prompt();
      return;
    }

    if (query.toLowerCase().startsWith('switch ')) {
      const newModel = query.substring(7).trim();
      currentModel = newModel;
      console.log(`✅ Switched to model: ${newModel}`);
      rl.prompt();
      return;
    }

    try {
      const answer = await askMedicalAid(query, currentModel);
      console.log(answer);
      console.log();
    } catch (error: any) {
      console.log(`\n❌ Error: ${error.message}`);
    }

    rl.prompt();
  });
}

// Run
if (import.meta.url === `file://${process.argv[1]}`) {
  runInteractive().catch(console.error);
}

export { askMedicalAid, searchDocuments };

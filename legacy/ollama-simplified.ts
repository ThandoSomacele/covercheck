#!/usr/bin/env node

/**
 * OLLAMA with SIMPLIFIED EXPLANATIONS
 *
 * Enhanced RAG system that provides:
 * 1. Simple, jargon-free answers FIRST
 * 2. Practical cost information
 * 3. Key terms explained with analogies
 * 4. Technical details (optional)
 *
 * Perfect for users who find insurance confusing!
 */

import { Ollama } from 'ollama';
import * as readline from 'readline';
import { getSimplificationPrompt, insuranceGlossary } from './insurance-jargon-glossary.js';

// Same document/product databases as ollama-simple.ts
interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  metadata: Record<string, any>;
}

interface Product {
  id: string;
  name: string;
  type: string;
  premium_monthly: number;
  deductible: number;
  coverage_max: number;
  key_features: string[];
}

const documentsDB: Document[] = [
  {
    id: 'doc-001',
    title: 'Health Insurance Plan A - Coverage Details',
    content: `Health Insurance Plan A provides comprehensive coverage for:

- Inpatient hospitalisation: 100% coverage after R9,000 deductible
- Outpatient services: 80% coverage after R1,800 co-payment
- Prescription drugs: Tier 1 (R180), Tier 2 (R540), Tier 3 (R1,080)
- Preventive care: 100% coverage, no deductible
- Emergency room: R4,500 co-payment, then 100% coverage
- Annual out-of-pocket maximum: R90,000 individual / R180,000 family
- Network: PPO with 50,000+ providers nationwide

Premium: R8,100/month individual, R21,600/month family`,
    category: 'health_insurance',
    metadata: { plan_type: 'PPO', annual_cost: 5400 },
  },
  {
    id: 'doc-002',
    title: 'Health Insurance Plan B - Coverage Details',
    content: `Health Insurance Plan B is our high-deductible health plan with HSA:

- Annual deductible: R54,000 individual / R108,000 family
- After deductible: 100% coverage for all services
- Preventive care: 100% coverage, no deductible
- HSA contribution: Employer adds R18,000/year
- Out-of-pocket maximum: R108,000 individual / R216,000 family
- Network: PPO with 45,000+ providers

Premium: R4,500/month individual, R12,600/month family

Best for: Healthy individuals who want lower premiums and HSA tax benefits`,
    category: 'health_insurance',
    metadata: { plan_type: 'HDHP', annual_cost: 3000 },
  },
  {
    id: 'doc-003',
    title: 'Dental Insurance Standard Plan',
    content: `Standard Dental Insurance Coverage:

- Preventive care (cleanings, exams): 100% coverage, 2x per year
- Basic procedures (fillings, extractions): 80% coverage after R900 deductible
- Major procedures (crowns, root canals): 50% coverage after R900 deductible
- Orthodontia: 50% coverage, R27,000 lifetime maximum
- Annual maximum benefit: R36,000 per person
- Network: 30,000+ dentists nationwide

Premium: R630/month individual, R1,620/month family`,
    category: 'dental_insurance',
    metadata: { annual_max: 2000, preventive_coverage: 100 },
  },
  {
    id: 'doc-004',
    title: 'Life Insurance Term Policy Guide',
    content: `Term Life Insurance Options:

10-Year Term:
- Coverage amounts: R1,800,000 - R18,000,000
- Fixed premiums for 10 years
- No cash value accumulation
- Convertible to permanent insurance

20-Year Term:
- Coverage amounts: R1,800,000 - R36,000,000
- Level premiums guaranteed for 20 years
- Can add riders: Critical illness, disability waiver
- Most popular option for families

30-Year Term:
- Coverage amounts: R4,500,000 - R54,000,000
- Best for long-term protection (mortgage, children)

Pricing example (age 35, non-smoker):
- R9,000,000 / 20-year: R630/month
- R18,000,000 / 20-year: R1,080/month`,
    category: 'life_insurance',
    metadata: { type: 'term', renewable: true },
  },
  {
    id: 'doc-005',
    title: 'Claims Filing Procedures',
    content: `How to File an Insurance Claim:

HEALTH INSURANCE CLAIMS:
1. Obtain itemized bill from provider
2. Submit claim within 90 days of service
3. Include: Policy number, date of service, provider details
4. Online portal: claims.ourinsurance.com
5. Processing time: 15-30 business days
6. Appeals: Available within 180 days of denial

DENTAL CLAIMS:
1. Dentist typically files directly
2. If self-filing: Use Form D-100
3. Attach x-rays for major procedures
4. Processing: 10-15 business days

LIFE INSURANCE CLAIMS:
1. Call beneficiary line: 1-800-555-LIFE
2. Required documents: Death certificate, policy number, beneficiary ID
3. Payment issued within 30 days of complete documentation

Claims support: claims@ourinsurance.com or 1-800-555-HELP`,
    category: 'procedures',
    metadata: { topic: 'claims' },
  },
];

const productsDB: Product[] = [
  {
    id: 'prod-health-a',
    name: 'Health Plan A - Comprehensive PPO',
    type: 'health',
    premium_monthly: 450,
    deductible: 500,
    coverage_max: 5000,
    key_features: ['Low deductible', 'Wide network', 'Prescription coverage', 'No referrals needed'],
  },
  {
    id: 'prod-health-b',
    name: 'Health Plan B - HDHP with HSA',
    type: 'health',
    premium_monthly: 250,
    deductible: 3000,
    coverage_max: 6000,
    key_features: ['Lower premium', 'HSA eligible', 'Employer contribution', '100% after deductible'],
  },
  {
    id: 'prod-dental-std',
    name: 'Dental Standard',
    type: 'dental',
    premium_monthly: 35,
    deductible: 50,
    coverage_max: 2000,
    key_features: ['100% preventive', 'Orthodontia included', 'Large network'],
  },
];

// Search function
function searchDocuments(query: string, limit: number = 3): Document[] {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/);

  const scored = documentsDB.map(doc => {
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

// Initialize Ollama client
const ollama = new Ollama({ host: 'http://localhost:11434' });

// Enhanced RAG function with simplified explanations
async function askInsuranceSimplified(question: string, model: string = 'llama3.1'): Promise<string> {
  console.log('\n🔍 Searching documents...');

  const relevantDocs = searchDocuments(question, 3);

  if (relevantDocs.length === 0) {
    return "I couldn't find information about that in our insurance documents. Can you rephrase your question or ask about a specific plan?";
  }

  console.log(`✅ Found ${relevantDocs.length} relevant document(s)`);
  relevantDocs.forEach(doc => console.log(`   - ${doc.title}`));

  // Build context
  const context = relevantDocs.map(doc => `Document: ${doc.title}\n${doc.content}`).join('\n\n---\n\n');

  // Get the simplification instructions
  const simplificationPrompt = getSimplificationPrompt();

  // Build the complete prompt
  const prompt = `${simplificationPrompt}

INSURANCE DOCUMENTS TO USE:
${context}

USER'S QUESTION: ${question}

YOUR ANSWER (Remember: Simple language first, then details!):`;

  console.log(`\n🤖 Asking ${model}...`);

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
║  Insurance Made Simple - No Jargon Edition 😊             ║
║  Ask questions in plain English, get clear answers        ║
╚═══════════════════════════════════════════════════════════╝

💬 How this works:
   - Ask ANY question about insurance
   - Get a SIMPLE answer first (no confusing terms!)
   - See what it actually costs you
   - Get technical details only if you want them

📚 Loaded: ${documentsDB.length} insurance plans
🤖 Using: Ollama (100% private, $0 cost)
📖 Jargon dictionary: ${insuranceGlossary.length} terms explained

Commands:
  - Type your question naturally
  - 'models' - see available AI models
  - 'glossary' - see all insurance terms explained
  - 'switch <model>' - change AI model
  - 'exit' - quit

Example questions (ask naturally!):
  - "If I break my arm, what will I pay?"
  - "What's the difference between Plan A and B?"
  - "How do I file a claim?"
  - "Is it worth paying more per month for Plan A?"
  - "What does 'deductible' mean?"
  - "Can I see any doctor or just specific ones?"
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
          console.log(`ℹ️  Using ${currentModel} (default models not found)`);
        } else {
          console.log(`❌ No models found! Run: ollama pull llama3.1`);
          process.exit(1);
        }
      } else {
        currentModel = 'llama3.1';
      }
    }
  } catch (error) {
    console.log(`❌ Cannot connect to Ollama. Start it with: ollama serve`);
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
      console.log("\n👋 Take care! Remember, insurance doesn't have to be confusing.");
      process.exit(0);
    }

    if (query.toLowerCase() === 'glossary') {
      console.log('\n📖 INSURANCE JARGON DICTIONARY\n');
      console.log('Here are common insurance terms explained simply:\n');

      const categories = Array.from(new Set(insuranceGlossary.map(t => t.category)));
      categories.forEach(cat => {
        console.log(`\n📌 ${cat.toUpperCase().replace(/-/g, ' ')}:`);
        insuranceGlossary
          .filter(t => t.category === cat)
          .forEach(term => {
            console.log(`\n  • ${term.term}`);
            console.log(`    ${term.simpleExplanation}`);
            if (term.analogy) {
              console.log(`    💡 ${term.analogy}`);
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
          console.log(`   ${isCurrent ? '→' : ' '} ${m.name}`);
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
      const answer = await askInsuranceSimplified(query, currentModel);
      console.log(`\n${answer}\n`);
    } catch (error: any) {
      console.log(`\n❌ Error: ${error.message}`);
    }

    rl.prompt();
  });
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runInteractive().catch(console.error);
}

// Export for programmatic use
export { askInsuranceSimplified, searchDocuments };

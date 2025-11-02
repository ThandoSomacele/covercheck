#!/usr/bin/env node

/**
 * OLLAMA SIMPLE RAG INTEGRATION
 *
 * Direct integration with Ollama (no MCP) for quick MVP/prototyping.
 * Uses the same document/product databases from server.ts but queries Ollama directly.
 *
 * Setup:
 * 1. Install Ollama: brew install ollama (or visit ollama.ai)
 * 2. Pull a model: ollama pull llama3.1
 * 3. Run: npm run ollama
 */

import { Ollama } from 'ollama';
import * as readline from 'readline';

// Import data structures from server.ts
// In production, you'd import these properly, but for MVP we'll duplicate
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

// Same databases as server.ts
const documentsDB: Document[] = [
  {
    id: "doc-001",
    title: "Health Insurance Plan A - Coverage Details",
    content: `Health Insurance Plan A provides comprehensive coverage for:

- Inpatient hospitalization: 100% coverage after R9,000 deductible
- Outpatient services: 80% coverage after R1,800 co-payment
- Prescription drugs: Tier 1 (R180), Tier 2 (R540), Tier 3 (R1,080)
- Preventive care: 100% coverage, no deductible
- Emergency room: R4,500 co-payment, then 100% coverage
- Annual out-of-pocket maximum: R90,000 individual / R180,000 family
- Network: PPO with 50,000+ providers nationwide

Premium: R8,100/month individual, R21,600/month family`,
    category: "health_insurance",
    metadata: { plan_type: "PPO", annual_cost: 5400 }
  },
  {
    id: "doc-002",
    title: "Health Insurance Plan B - Coverage Details",
    content: `Health Insurance Plan B is our high-deductible health plan with HSA:

- Annual deductible: R54,000 individual / R108,000 family
- After deductible: 100% coverage for all services
- Preventive care: 100% coverage, no deductible
- HSA contribution: Employer adds R18,000/year
- Out-of-pocket maximum: R108,000 individual / R216,000 family
- Network: PPO with 45,000+ providers

Premium: R4,500/month individual, R12,600/month family

Best for: Healthy individuals who want lower premiums and HSA tax benefits`,
    category: "health_insurance",
    metadata: { plan_type: "HDHP", annual_cost: 3000 }
  },
  {
    id: "doc-003",
    title: "Dental Insurance Standard Plan",
    content: `Standard Dental Insurance Coverage:

- Preventive care (cleanings, exams): 100% coverage, 2x per year
- Basic procedures (fillings, extractions): 80% coverage after R900 deductible
- Major procedures (crowns, root canals): 50% coverage after R900 deductible
- Orthodontia: 50% coverage, R27,000 lifetime maximum
- Annual maximum benefit: R36,000 per person
- Network: 30,000+ dentists nationwide

Premium: R630/month individual, R1,620/month family`,
    category: "dental_insurance",
    metadata: { annual_max: 2000, preventive_coverage: 100 }
  },
  {
    id: "doc-004",
    title: "Life Insurance Term Policy Guide",
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
    category: "life_insurance",
    metadata: { type: "term", renewable: true }
  },
  {
    id: "doc-005",
    title: "Claims Filing Procedures",
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
    category: "procedures",
    metadata: { topic: "claims" }
  }
];

const productsDB: Product[] = [
  {
    id: "prod-health-a",
    name: "Health Plan A - Comprehensive PPO",
    type: "health",
    premium_monthly: 450,
    deductible: 500,
    coverage_max: 5000,
    key_features: ["Low deductible", "Wide network", "Prescription coverage", "No referrals needed"]
  },
  {
    id: "prod-health-b",
    name: "Health Plan B - HDHP with HSA",
    type: "health",
    premium_monthly: 250,
    deductible: 3000,
    coverage_max: 6000,
    key_features: ["Lower premium", "HSA eligible", "Employer contribution", "100% after deductible"]
  },
  {
    id: "prod-dental-std",
    name: "Dental Standard",
    type: "dental",
    premium_monthly: 35,
    deductible: 50,
    coverage_max: 2000,
    key_features: ["100% preventive", "Orthodontia included", "Large network"]
  }
];

// Simple search function (same logic as server.ts)
function searchDocuments(query: string, limit: number = 3): Document[] {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/);

  const scored = documentsDB.map(doc => {
    const contentLower = (doc.title + " " + doc.content).toLowerCase();
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

function queryProducts(filters?: { type?: string; maxPremium?: number }): Product[] {
  let results = productsDB;

  if (filters?.type) {
    results = results.filter(p => p.type === filters.type);
  }

  if (filters?.maxPremium !== undefined) {
    results = results.filter(p => p.premium_monthly <= filters.maxPremium!);
  }

  return results;
}

// Initialize Ollama client
const ollama = new Ollama({ host: 'http://localhost:11434' });

// Main RAG function
async function askInsurance(question: string, model: string = 'llama3.1'): Promise<string> {
  console.log('\n🔍 Searching documents...');

  // 1. Search relevant documents
  const relevantDocs = searchDocuments(question, 3);

  if (relevantDocs.length === 0) {
    return "I couldn't find any relevant information in our insurance documentation. Please try rephrasing your question.";
  }

  console.log(`✅ Found ${relevantDocs.length} relevant document(s)`);
  relevantDocs.forEach(doc => console.log(`   - ${doc.title}`));

  // 2. Build context from documents
  const context = relevantDocs.map(doc =>
    `Document: ${doc.title}\n${doc.content}`
  ).join('\n\n---\n\n');

  // 3. Query Ollama with context
  console.log(`\n🤖 Asking ${model}...`);

  const prompt = `You are an insurance documentation assistant. Answer the user's question based ONLY on the provided insurance documents. If the answer isn't in the documents, say so.

INSURANCE DOCUMENTS:
${context}

USER QUESTION: ${question}

ANSWER (be helpful, accurate, and cite specific details from the documents):`;

  try {
    const response = await ollama.chat({
      model: model,
      messages: [{
        role: 'user',
        content: prompt
      }],
      stream: false
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
╔════════════════════════════════════════════════════════════╗
║  Insurance Documentation Assistant (Ollama Edition)        ║
║  Direct RAG integration - No MCP required                  ║
╚════════════════════════════════════════════════════════════╝

📚 Loaded: ${documentsDB.length} documents, ${productsDB.length} products
🤖 Using: Ollama (local)
💰 Cost: $0 (runs on your machine)

Commands:
  - Type your question and press Enter
  - Type 'models' to list available models
  - Type 'switch <model>' to change model (e.g., 'switch mistral')
  - Type 'exit' to quit

Example questions:
  - What does Health Plan A cover?
  - Compare Health Plan A and Health Plan B
  - How do I file a dental claim?
  - What's the cheapest health insurance?
`);

  let currentModel = 'llama3.1';

  // Check if default model is available
  try {
    const models = await ollama.list();
    const modelNames = models.models.map((m: any) => m.name);

    if (!modelNames.some((m: string) => m.includes('llama3.1'))) {
      if (modelNames.length > 0) {
        currentModel = modelNames[0].split(':')[0];
        console.log(`⚠️  llama3.1 not found. Using ${currentModel} instead.`);
      } else {
        console.log(`❌ No models found! Please run: ollama pull llama3.1`);
        process.exit(1);
      }
    }
  } catch (error) {
    console.log(`❌ Cannot connect to Ollama. Is it running?`);
    console.log(`   Start it with: ollama serve`);
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\n❓ Your question: '
  });

  rl.prompt();

  rl.on('line', async (input: string) => {
    const query = input.trim();

    if (!query) {
      rl.prompt();
      return;
    }

    if (query.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!');
      process.exit(0);
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
      const answer = await askInsurance(query, currentModel);
      console.log(`\n💬 Answer:\n${answer}\n`);
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
export { askInsurance, searchDocuments, queryProducts };

#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * INSURANCE DOCUMENTATION MCP SERVER
 * 
 * This server demonstrates how to build a RAG (Retrieval-Augmented Generation)
 * system for insurance company documentation without training any AI models.
 * 
 * Components:
 * 1. Document Search Tool - Searches through insurance policies/manuals
 * 2. Product Database Tool - Queries structured product information
 * 3. Coverage Comparison Tool - Compares different insurance plans
 * 4. Resources - Direct access to policy documents
 */

// In-memory "vector database" (simplified for demo)
// In production, use: Pinecone, Weaviate, ChromaDB, or PostgreSQL with pgvector
interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  metadata: Record<string, any>;
}

// Sample insurance documents database
const documentsDB: Document[] = [
  {
    id: "doc-001",
    title: "Health Insurance Plan A - Coverage Details",
    content: `Health Insurance Plan A provides comprehensive coverage for:

- Inpatient hospitalisation: 100% coverage after R9,000 deductible
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

// Simple product database (structured data)
interface Product {
  id: string;
  name: string;
  type: string;
  premium_monthly: number;
  deductible: number;
  coverage_max: number;
  key_features: string[];
}

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

// Simple text search (in production, use embeddings + vector similarity)
function searchDocuments(query: string, limit: number = 3): Document[] {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/);
  
  // Score each document based on term frequency
  const scored = documentsDB.map(doc => {
    const contentLower = (doc.title + " " + doc.content).toLowerCase();
    const score = queryTerms.reduce((acc, term) => {
      const matches = (contentLower.match(new RegExp(term, 'g')) || []).length;
      return acc + matches;
    }, 0);
    return { doc, score };
  });
  
  // Sort by score and return top results
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.doc);
}

// Create the MCP server
const server = new Server(
  {
    name: "insurance-documentation-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_documentation",
        description: "Search through insurance policy documents, coverage details, and procedures. Use this when users ask about coverage, benefits, procedures, or policy details.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query - what the user wants to know about",
            },
            category: {
              type: "string",
              enum: ["all", "health_insurance", "dental_insurance", "life_insurance", "procedures"],
              description: "Filter by document category (optional)",
            },
            max_results: {
              type: "number",
              description: "Maximum number of results to return (default: 3)",
              default: 3,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "query_products",
        description: "Query the structured product database for specific insurance plans, pricing, and features. Use this for direct product comparisons or pricing questions.",
        inputSchema: {
          type: "object",
          properties: {
            product_type: {
              type: "string",
              enum: ["all", "health", "dental", "life"],
              description: "Type of insurance product",
            },
            max_premium: {
              type: "number",
              description: "Maximum monthly premium budget (optional)",
            },
          },
        },
      },
      {
        name: "compare_plans",
        description: "Compare multiple insurance plans side-by-side with detailed breakdown of differences. Best for 'which plan is better' questions.",
        inputSchema: {
          type: "object",
          properties: {
            plan_ids: {
              type: "array",
              items: { type: "string" },
              description: "Array of product IDs to compare (e.g., ['prod-health-a', 'prod-health-b'])",
            },
          },
          required: ["plan_ids"],
        },
      },
      {
        name: "calculate_annual_cost",
        description: "Calculate the total annual cost of an insurance plan including premiums and estimated out-of-pocket expenses.",
        inputSchema: {
          type: "object",
          properties: {
            product_id: {
              type: "string",
              description: "Product ID to calculate costs for",
            },
            estimated_usage: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "Expected healthcare usage level",
            },
          },
          required: ["product_id", "estimated_usage"],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_documentation": {
        const { query, category = "all", max_results = 3 } = args as any;
        
        let results = searchDocuments(query, max_results);
        
        // Filter by category if specified
        if (category !== "all") {
          results = results.filter(doc => doc.category === category);
        }
        
        if (results.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No documents found matching "${query}". Available categories: health_insurance, dental_insurance, life_insurance, procedures.`
            }]
          };
        }
        
        const responseText = results.map(doc => 
          `## ${doc.title}\n**Category:** ${doc.category}\n**Document ID:** ${doc.id}\n\n${doc.content}\n\n---\n`
        ).join("\n");
        
        return {
          content: [{
            type: "text",
            text: `Found ${results.length} relevant document(s):\n\n${responseText}`
          }]
        };
      }

      case "query_products": {
        const { product_type = "all", max_premium } = args as any;
        
        let results = productsDB;
        
        if (product_type !== "all") {
          results = results.filter(p => p.type === product_type);
        }
        
        if (max_premium) {
          results = results.filter(p => p.premium_monthly <= max_premium);
        }
        
        const responseText = results.map(product => 
          `### ${product.name}\n` +
          `- **Type:** ${product.type}\n` +
          `- **Monthly Premium:** R${product.premium_monthly}\n` +
          `- **Annual Premium:** R${product.premium_monthly * 12}\n` +
          `- **Deductible:** R${product.deductible}\n` +
          `- **Out-of-Pocket Max:** R${product.coverage_max}\n` +
          `- **Key Features:**\n${product.key_features.map(f => `  - ${f}`).join('\n')}\n` +
          `- **Product ID:** ${product.id}\n`
        ).join("\n\n");
        
        return {
          content: [{
            type: "text",
            text: results.length > 0 
              ? `Found ${results.length} product(s):\n\n${responseText}`
              : "No products match your criteria."
          }]
        };
      }

      case "compare_plans": {
        const { plan_ids } = args as any;
        
        const plans = productsDB.filter(p => plan_ids.includes(p.id));
        
        if (plans.length < 2) {
          return {
            content: [{
              type: "text",
              text: "Need at least 2 valid plan IDs to compare. Available IDs: " + 
                    productsDB.map(p => p.id).join(", ")
            }]
          };
        }
        
        const comparison = `# Plan Comparison\n\n` +
          `| Feature | ${plans.map(p => p.name).join(" | ")} |\n` +
          `|---------|${plans.map(() => "------").join("|")}|\n` +
          `| Monthly Premium | ${plans.map(p => `R${p.premium_monthly}`).join(" | ")} |\n` +
          `| Annual Premium | ${plans.map(p => `R${p.premium_monthly * 12}`).join(" | ")} |\n` +
          `| Deductible | ${plans.map(p => `R${p.deductible}`).join(" | ")} |\n` +
          `| Out-of-Pocket Max | ${plans.map(p => `R${p.coverage_max}`).join(" | ")} |\n\n` +
          `## Key Differences:\n\n` +
          plans.map((p, i) => 
            `### ${p.name}\n${p.key_features.map(f => `- ${f}`).join('\n')}`
          ).join("\n\n");
        
        return {
          content: [{
            type: "text",
            text: comparison
          }]
        };
      }

      case "calculate_annual_cost": {
        const { product_id, estimated_usage } = args as any;
        
        const product = productsDB.find(p => p.id === product_id);
        
        if (!product) {
          return {
            content: [{
              type: "text",
              text: "Product not found. Available IDs: " + productsDB.map(p => p.id).join(", ")
            }]
          };
        }
        
        // Estimate out-of-pocket costs based on usage
        const usageEstimates = {
          low: product.deductible * 0.3,      // Minimal claims
          medium: product.deductible * 0.7,   // Some claims
          high: product.coverage_max * 0.9    // Hit the max
        };
        
        const annualPremium = product.premium_monthly * 12;
        const estimatedOutOfPocket = usageEstimates[estimated_usage as keyof typeof usageEstimates];
        const totalAnnualCost = annualPremium + estimatedOutOfPocket;
        
        const breakdown = `# Annual Cost Calculation: ${product.name}\n\n` +
          `## Assumptions:\n` +
          `- Usage Level: **${estimated_usage.toUpperCase()}**\n\n` +
          `## Cost Breakdown:\n` +
          `- Monthly Premium: R${product.premium_monthly}\n` +
          `- Annual Premium: R${annualPremium}\n` +
          `- Estimated Out-of-Pocket: R${estimatedOutOfPocket.toFixed(2)}\n` +
          `- **Total Annual Cost: R${totalAnnualCost.toFixed(2)}**\n\n` +
          `## Notes:\n` +
          `- Low usage: Minor preventive care, few claims\n` +
          `- Medium usage: Regular doctor visits, some prescriptions\n` +
          `- High usage: Multiple procedures, frequent care, approaching out-of-pocket maximum`;
        
        return {
          content: [{
            type: "text",
            text: breakdown
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error executing tool: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true,
    };
  }
});

// Define available resources (direct document access)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: documentsDB.map(doc => ({
      uri: `insurance://documents/${doc.id}`,
      name: doc.title,
      mimeType: "text/plain",
      description: `${doc.category} - ${doc.title}`,
    })),
  };
});

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  const docId = uri.replace("insurance://documents/", "");
  
  const doc = documentsDB.find(d => d.id === docId);
  
  if (!doc) {
    throw new Error(`Document not found: ${docId}`);
  }
  
  return {
    contents: [{
      uri: uri,
      mimeType: "text/plain",
      text: `# ${doc.title}\n\n**Category:** ${doc.category}\n\n${doc.content}`,
    }],
  };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Insurance Documentation MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

# System Architecture Diagrams

## 1. Current Simple Implementation

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Desktop                        │
│                  (Your User Interface)                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ MCP Protocol
                         │ (stdio transport)
                         │
┌────────────────────────▼────────────────────────────────┐
│              insurance-simplified/server.ts              │
│                  (Your MCP Server)                       │
│                                                          │
│  Tools:                                                  │
│  ┌────────────────────────────────────────────┐        │
│  │ 1. search_documentation(query)             │        │
│  │    → Searches documentsDB                  │        │
│  │                                             │        │
│  │ 2. query_products(type, max_premium)       │        │
│  │    → Queries productsDB                    │        │
│  │                                             │        │
│  │ 3. compare_plans(plan_ids[])               │        │
│  │    → Generates comparison table            │        │
│  │                                             │        │
│  │ 4. calculate_annual_cost(id, usage)        │        │
│  │    → Projects yearly costs                 │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  Resources:                                              │
│  ┌────────────────────────────────────────────┐        │
│  │ insurance://documents/doc-001               │        │
│  │ insurance://documents/doc-002               │        │
│  │ ... (direct document access)                │        │
│  └────────────────────────────────────────────┘        │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ In-Memory
                         │
         ┌───────────────┴───────────────┐
         │                               │
┌────────▼────────┐            ┌─────────▼────────┐
│  documentsDB    │            │   productsDB     │
│  (Array)        │            │   (Array)        │
│                 │            │                  │
│  5 documents    │            │  3 products      │
│  Simple search  │            │  Direct queries  │
└─────────────────┘            └──────────────────┘

Pros: Simple, fast, R0 cost
Cons: Limited to ~100 docs, keyword-only search
```

## 2. Production with Vector Database

```
┌─────────────────────────────────────────────────────────┐
│              Employee's Browser / Slack                  │
│                     (Web Interface)                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ HTTPS / API
                         │
┌────────────────────────▼────────────────────────────────┐
│                 Express.js Backend                       │
│              (web-interface-example.ts)                  │
│                                                          │
│  • Authentication                                        │
│  • Rate limiting                                         │
│  • Usage analytics                                       │
│  • Conversation history                                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ API Call
                         │
┌────────────────────────▼────────────────────────────────┐
│                   Claude API                             │
│              (No training needed!)                       │
│                                                          │
│  Model: claude-sonnet-4-20250514                         │
│  Tools: Defined by your API                              │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Tool Calls
                         │
┌────────────────────────▼────────────────────────────────┐
│              Your Tool Functions                         │
│         (production-example.ts integrated)               │
│                                                          │
│  1. search_documentation(query)                          │
│     │                                                    │
│     ├─→ Create embedding with OpenAI                    │
│     │   ("surgery" → [0.1, 0.5, ...])                   │
│     │                                                    │
│     └─→ Query vector database                           │
│         Finds by MEANING, not keywords!                  │
│                                                          │
│  2. query_products(filters)                              │
│     └─→ SQL query to products table                     │
│                                                          │
│  3. compare_plans(ids)                                   │
│     └─→ Join query across databases                     │
│                                                          │
│  4. calculate_annual_cost(id, usage)                     │
│     └─→ Business logic calculation                      │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
┌────────▼────────┐            ┌─────────▼────────┐
│   ChromaDB /    │            │   PostgreSQL     │
│   Pinecone      │            │                  │
│                 │            │                  │
│ • 10,000+ docs  │            │ • Products       │
│ • Embeddings    │            │ • Pricing        │
│ • Semantic      │            │ • Coverage       │
│   search        │            │ • Claims history │
│ • Metadata      │            │                  │
│   filtering     │            │                  │
└─────────────────┘            └──────────────────┘

Pros: Scales to millions of docs, semantic search, production-ready
Costs: R5,400-27,000/month
```

## 3. Query Flow Example

```
USER ASKS: "What's covered if I need surgery?"

Step 1: Question enters system
┌──────────────────────────┐
│ "What's covered if I     │
│  need surgery?"          │
└────────┬─────────────────┘
         │
         ▼
Step 2: Claude receives question
┌──────────────────────────┐
│ Claude analyzes question │
│ Decides: Need to search  │
│          documentation   │
└────────┬─────────────────┘
         │
         ▼
Step 3: Claude calls tool
┌──────────────────────────┐
│ Tool: search_documentation│
│ Args: {                  │
│   query: "surgery        │
│           coverage",     │
│   category: "health"     │
│ }                        │
└────────┬─────────────────┘
         │
         ▼
Step 4: Your server processes
┌──────────────────────────┐
│ Create embedding for     │
│ "surgery coverage"       │
│                          │
│ Vector: [0.2, 0.8, ...]  │
└────────┬─────────────────┘
         │
         ▼
Step 5: Search vector DB
┌──────────────────────────┐
│ Find similar vectors     │
│                          │
│ Matches:                 │
│ 1. "Inpatient hospital-  │
│     ization: 100%..."    │
│    (Similarity: 0.89)    │
│                          │
│ 2. "Major procedures:    │
│     covered after..."    │
│    (Similarity: 0.85)    │
└────────┬─────────────────┘
         │
         ▼
Step 6: Return to Claude
┌──────────────────────────┐
│ Documents returned with  │
│ content and metadata     │
└────────┬─────────────────┘
         │
         ▼
Step 7: Claude synthesizes answer
┌──────────────────────────┐
│ "Based on Health Plan A, │
│ surgery is covered as    │
│ 'inpatient hospitaliza-  │
│ tion' with 100% coverage │
│ after your R9,000          │
│ deductible."             │
│                          │
│ Source: Health Plan A    │
│ Coverage Details         │
└────────┬─────────────────┘
         │
         ▼
Step 8: User sees answer
┌──────────────────────────┐
│ ✅ Accurate answer       │
│ ✅ Source cited          │
│ ✅ < 2 seconds           │
└──────────────────────────┘

Total time: 1-2 seconds
Total cost: ~R0.36
```

## 4. Data Flow for Document Updates

```
NEW POLICY RELEASED
         │
         ▼
┌─────────────────────────────────┐
│  1. Add PDF to system            │
│     upload_policy.pdf            │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  2. Process Document             │
│     • Extract text (PDFLoader)   │
│     • Split into chunks          │
│     • Add metadata               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  3. Create Embeddings            │
│     • Call OpenAI API            │
│     • Convert text → vectors     │
│     • Cost: ~R0.18 per doc       │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  4. Store in Vector DB           │
│     • Save vectors               │
│     • Save metadata              │
│     • Index for fast search      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  5. IMMEDIATELY Available        │
│     • No retraining needed!      │
│     • Answers update instantly   │
│     • Old version deprecated     │
└─────────────────────────────────┘

vs. Fine-tuning approach:
         │
         ▼
❌ Retrain model (R90,000)
❌ Wait 1-2 weeks
❌ Deploy new model
❌ Test accuracy
❌ Maybe it learned correctly?
```

## 5. Cost Comparison Visualization

```
OPTION 1: Build Your Own AI
╔════════════════════════════════════════════════╗
║                                                ║
║  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$      ║
║  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$      ║
║  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$      ║
║  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$      ║
║  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$      ║
║                                                ║
║  Cost: R18,000,000+                             ║
║  Time: 12-24 months                            ║
║  Team: 10+ people                              ║
║  Risk: VERY HIGH                               ║
╚════════════════════════════════════════════════╝

OPTION 2: Fine-Tune GPT-4/Claude
╔════════════════════════════════════════════════╗
║                                                ║
║  $$$$$$$$$$$$$$$                               ║
║  $$$$$$$$$$$$$$$                               ║
║  (every quarter)                               ║
║                                                ║
║  Cost: R900,000/year                            ║
║  Time: 4-8 weeks                               ║
║  Team: 2-3 people                              ║
║  Risk: MEDIUM                                  ║
╚════════════════════════════════════════════════╝

OPTION 3: RAG + MCP (This Project!)
╔════════════════════════════════════════════════╗
║                                                ║
║  $$                                            ║
║                                                ║
║  Cost: R180,000 setup + R9,000/month              ║
║  Time: 1-4 weeks                               ║
║  Team: 1-2 people                              ║
║  Risk: LOW                                     ║
║  Updates: FREE & INSTANT                       ║
╚════════════════════════════════════════════════╝
```

## 6. Integration Options

```
                    ┌─────────────────┐
                    │  Your MCP       │
                    │  Server         │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │   Claude    │  │   Web App   │  │   Slack     │
    │   Desktop   │  │   (React)   │  │   Bot       │
    └─────────────┘  └─────────────┘  └─────────────┘
              │              │              │
              ▼              ▼              ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │  Personal   │  │  Customer   │  │   Team      │
    │    Use      │  │   Support   │  │  Channels   │
    └─────────────┘  └─────────────┘  └─────────────┘

              │              │              │
              └──────────────┼──────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Microsoft     │
                    │     Teams       │
                    └─────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    WhatsApp     │
                    │    Business     │
                    └─────────────────┘
```

## 7. Accuracy Improvement Over Time

```
        Accuracy %
        100% │                                    ★ RAG
             │                               ★
             │                          ★
        90%  │                     ★                Fine-tuned
             │                ★              ✦
             │           ★              ✦
        80%  │      ★              ✦
             │  ★              ✦
             │              ✦
        70%  │          ✦
             │      ✦
             │  ✦
        60%  └──────┬────────┬────────┬────────┬─────
             Week 1  Week 2  Month 1  Month 3  Month 6

    ★ = RAG (improves as you add more docs)
    ✦ = Fine-tuned (degrades as data becomes stale)
```

## Key Takeaways from Diagrams

1. **Simple Start**: Current implementation is production-ready for small scale
2. **Clear Upgrade Path**: Easy progression to vector DB when needed
3. **Real-time Updates**: Change docs, answers change instantly
4. **Cost Effective**: 100x cheaper than alternatives
5. **Multiple Interfaces**: One backend, many frontends
6. **Proven Pattern**: This is how most companies do it in 2024

## Next Steps

1. Run `./setup.sh`
2. Test with Claude Desktop (diagram #1)
3. Add your documents
4. When ready to scale, implement diagram #2
5. When ready for team access, implement diagram #6

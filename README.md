# Insurance Documentation MCP Server

A production-ready example of using **RAG (Retrieval-Augmented Generation)** with **MCP (Model Context Protocol)** to create an AI-powered documentation assistant for insurance companies.

## 🎯 What This Solves

This demonstrates how to build a system where:
- Customer service reps can ask natural language questions about insurance products
- Sales teams can instantly compare plans and calculate costs
- Agents get accurate, sourced answers without memorizing documentation
- **NO AI TRAINING REQUIRED** - uses existing Claude/GPT with your data

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│  User: "What's covered in Plan A?"  │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│     Claude/GPT (via API)            │  ← No training needed!
│     Understands natural language     │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│   Insurance MCP Server (This!)      │
│   - search_documentation tool       │
│   - query_products tool             │
│   - compare_plans tool              │
│   - calculate_annual_cost tool      │
└─────────────┬───────────────────────┘
              │
     ┌────────┴────────┐
     │                 │
┌────▼─────┐    ┌─────▼──────┐
│Documents │    │  Products  │
│ Database │    │  Database  │
└──────────┘    └────────────┘
```

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ installed
- Claude Desktop app (or any MCP-compatible client)

### Installation

```bash
# Navigate to the project directory
cd insurance-simplified

# Install dependencies
npm install

# Build the TypeScript
npm run build

# Test it works
npm start
# You should see: "Insurance Documentation MCP Server running on stdio"
# Press Ctrl+C to stop
```

### Configure Claude Desktop

1. Open Claude Desktop settings
2. Find the MCP configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

3. Add this configuration:

```json
{
  "mcpServers": {
    "insurance-docs": {
      "command": "node",
      "args": ["/FULL/PATH/TO/insurance-simplified/build/server.js"]
    }
  }
}
```

**Important**: Replace `/FULL/PATH/TO/` with the actual absolute path!

4. Restart Claude Desktop

### Test It Out

Open Claude Desktop and try these queries:

```
"What does Health Plan A cover?"

"Compare Health Plan A and Health Plan B"

"If I use healthcare a lot, which plan is cheaper?"

"How do I file a dental claim?"

"What's the annual cost of Plan A with medium usage?"
```

## 📚 How It Works

### The RAG Pattern

**Traditional Approach** (Wrong for this use case):
```
Train AI on documents → Hope it remembers → No updates without retraining
```

**RAG Approach** (What we're doing):
```
User asks question → Search relevant documents → Send to AI with context → AI answers with sources
```

### Why This is Better

1. **Always Up-to-Date**: Change a document, answers change immediately
2. **Auditable**: Every answer cites its source document
3. **Cost-Effective**: No expensive training runs
4. **Accurate**: AI reads actual current documentation, not memories
5. **Flexible**: Easy to add new document types or data sources

### The Four Tools

1. **`search_documentation`** - Full-text search through policy documents
   - Like giving Claude a search engine for your docs
   - Returns relevant sections with context

2. **`query_products`** - Structured queries on product database
   - Filter by price, type, features
   - Returns exact pricing and specifications

3. **`compare_plans`** - Side-by-side plan comparison
   - Generates comparison tables
   - Highlights key differences

4. **`calculate_annual_cost`** - Cost projection tool
   - Estimates total annual costs
   - Accounts for usage patterns

## 🔧 Customization Guide

### Adding Your Own Documents

Edit the `documentsDB` array in `server.ts`:

```typescript
const documentsDB: Document[] = [
  {
    id: "doc-YOUR-ID",
    title: "Your Document Title",
    content: `Your full document content here...`,
    category: "your_category",
    metadata: { any: "custom fields" }
  },
  // ... more documents
];
```

### Adding Your Own Products

Edit the `productsDB` array:

```typescript
const productsDB: Product[] = [
  {
    id: "prod-your-id",
    name: "Your Product Name",
    type: "product_type",
    premium_monthly: 299,
    deductible: 1000,
    coverage_max: 5000,
    key_features: ["Feature 1", "Feature 2"]
  },
];
```

### Scaling to Production

For real-world use, replace the in-memory storage:

#### 1. Vector Database (for document search)

```typescript
// Instead of simple text matching, use embeddings
import { OpenAI } from "openai";
import { ChromaClient } from "chromadb";

// Create embedding for search query
const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: query
});

// Search vector database
const results = await chromaClient.query({
  embedding: embedding.data[0].embedding,
  n_results: 5
});
```

**Recommended Vector DBs**:
- **ChromaDB**: Easy local setup, Python/JS support
- **Pinecone**: Managed service, scales automatically
- **Weaviate**: Open-source, powerful
- **PostgreSQL + pgvector**: If you already use Postgres

#### 2. Real Database (for structured data)

```typescript
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const products = await pool.query(
  "SELECT * FROM products WHERE type = $1 AND premium_monthly <= $2",
  [product_type, max_premium]
);
```

#### 3. Document Processing Pipeline

```typescript
// For PDFs, Word docs, etc.
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Load document
const loader = new PDFLoader("path/to/policy.pdf");
const docs = await loader.load();

// Split into chunks
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200
});
const chunks = await splitter.splitDocuments(docs);

// Store in vector DB with embeddings
for (const chunk of chunks) {
  const embedding = await createEmbedding(chunk.pageContent);
  await vectorDB.add({
    id: generateId(),
    content: chunk.pageContent,
    embedding: embedding,
    metadata: chunk.metadata
  });
}
```

## 📊 Real-World Implementation Path

### Phase 1: Proof of Concept (1 week)
- ✅ Use this example project
- ✅ Add 10-20 real documents
- ✅ Test with internal team
- ✅ Measure accuracy

### Phase 2: MVP (2-3 weeks)
- Replace in-memory DB with PostgreSQL
- Add ChromaDB for vector search
- Implement document chunking
- Add authentication
- Deploy to internal server

### Phase 3: Production (4-6 weeks)
- Scale vector DB (Pinecone/Weaviate)
- Add document update pipeline
- Build web interface (Slack/Teams integration)
- Implement usage analytics
- Add feedback loop for accuracy

### Phase 4: Optimization (ongoing)
- Fine-tune chunking strategy
- Optimize embedding model
- Add caching layer
- Implement hybrid search (keyword + vector)
- A/B test prompts

## 💰 Cost Comparison

### Building Your Own AI
- Training: R1,800,000 - R18,000,000+
- Infrastructure: R180,000/month
- Team: 3-5 ML engineers
- Timeline: 12-24 months
- **Not recommended for this use case**

### Fine-Tuning GPT-4/Claude
- Initial training: R90,000 - R360,000
- Retraining (quarterly): R90,000 each
- API costs: R9,000-36,000/month
- Maintenance: Significant
- **Not ideal - data becomes stale**

### RAG + MCP (This Approach)
- Setup: 1-4 weeks developer time
- Infrastructure: R3,600-18,000/month
  - Vector DB: R900-5,400/month
  - API calls: R1,800-9,000/month
  - Hosting: R900-3,600/month
- Maintenance: Minimal
- Updates: Real-time, no retraining
- **Recommended**

## 🔒 Security Considerations

For production deployment:

1. **Authentication**: Add OAuth/API keys
2. **Rate Limiting**: Prevent abuse
3. **Data Access Control**: Role-based permissions
4. **Audit Logging**: Track all queries
5. **PII Handling**: Redact sensitive information

Example authentication middleware:

```typescript
function validateApiKey(request: any): boolean {
  const apiKey = request.headers["x-api-key"];
  return apiKey && validApiKeys.includes(apiKey);
}
```

## 🧪 Testing

Test your MCP server before connecting to Claude:

```bash
# Use MCP Inspector
npx @modelcontextprotocol/inspector node build/server.js

# Or test tools directly
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm start
```

## 📈 Monitoring & Improvement

Track these metrics:

1. **Query Success Rate**: % of questions answered correctly
2. **Source Accuracy**: Are the right documents being retrieved?
3. **Response Time**: How fast are searches?
4. **User Satisfaction**: Thumbs up/down feedback
5. **Coverage Gaps**: What questions can't be answered?

## 🤝 Alternative Approaches

If MCP doesn't fit your needs:

1. **REST API + OpenAI Function Calling**: Similar pattern, different protocol
2. **LangChain + Vector Store**: More batteries-included framework
3. **Semantic Kernel**: Microsoft's orchestration framework
4. **Custom RAG Pipeline**: Full control, more work

MCP is best when:
- ✅ You want standardization
- ✅ You use Claude Desktop or compatible clients
- ✅ You need multiple tool integrations
- ✅ You want minimal infrastructure

## 📚 Next Steps

1. **Load Your Documents**: Replace sample data with real policies
2. **Connect to Real Database**: Set up PostgreSQL or similar
3. **Add Vector Search**: Integrate ChromaDB or Pinecone
4. **Build User Interface**: Web app, Slack bot, or Teams integration
5. **Measure & Iterate**: Track accuracy and improve

## 🆘 Troubleshooting

**Server won't start**:
```bash
# Check Node version
node --version  # Should be 18+

# Rebuild
npm run build
```

**Claude doesn't see the server**:
- Verify config file path is absolute, not relative
- Restart Claude Desktop
- Check Claude Desktop logs (Help → View Logs)

**Search returns no results**:
- Check document content has relevant keywords
- Try simpler queries first
- Add more documents to the database

## 📖 Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [Claude API Docs](https://docs.anthropic.com)
- [Vector Database Guide](https://www.pinecone.io/learn/vector-database/)
- [RAG Explained](https://www.anthropic.com/research/retrieval-augmented-generation)

## 🎓 Learning Path

1. **Understand this example** (this project)
2. **Learn vector embeddings** (ChromaDB tutorial)
3. **Study prompt engineering** (Anthropic docs)
4. **Build production pipeline** (LangChain/LlamaIndex)
5. **Optimize for scale** (caching, indexing strategies)

---

**Questions?** Open an issue or check the MCP community forums!

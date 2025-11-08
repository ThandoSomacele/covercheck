# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Insurance Documentation MCP (Model Context Protocol) Server that demonstrates RAG (Retrieval-Augmented Generation) for insurance documentation without training AI models. It provides tools for searching documents, querying products, comparing plans, and calculating costs.

**Key Principle:** This uses RAG pattern (live document retrieval) instead of fine-tuning. Documents can be updated in real-time without retraining.

## Commands

### Build and Development
```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Start the MCP server (for Claude Desktop)
npm start

# Development mode (build + start)
npm run dev

# Quick setup (runs all setup steps)
./setup.sh

# Ollama integration (local AI, R0 cost)
npm run ollama          # Interactive mode (original)
npm run ollama:simple   # With simplified explanations
npm run test-ollama     # Quick test
npm run demo            # Demo of simplified explanations

# South African version (RECOMMENDED)
npm run sa              # SA medical aid assistant with Rands, SA English
```

### Testing
```bash
# Test server manually
npm start
# Press Ctrl+C to stop

# Test with MCP Inspector
npx @modelcontextprotocol/inspector node build/server.js

# Test tools directly (in another terminal while server runs)
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm start
```

## Architecture

### Core Components

1. **MCP Server** (`server.ts`)
   - Main entry point with shebang for CLI execution
   - Uses stdio transport for Claude Desktop integration
   - Provides 4 tools + document resources

2. **In-Memory Databases** (server.ts:38-160)
   - `documentsDB`: Array of insurance documents (policies, manuals)
   - `productsDB`: Array of insurance products with pricing
   - **Production Note:** Replace with vector DB (ChromaDB/Pinecone) and SQL DB (PostgreSQL) for scale

3. **Tools Provided**
   - `search_documentation`: Full-text search through policy documents
   - `query_products`: Structured queries on product database
   - `compare_plans`: Side-by-side plan comparison
   - `calculate_annual_cost`: Cost projection based on usage patterns

4. **Resources**
   - Direct document access via `insurance://documents/{id}` URIs
   - Returns full document content and metadata

### Data Flow Pattern

```
User Question → Claude Desktop → MCP Server → In-Memory DB → Results → Claude → User
```

**Key Insight:** Claude never sees all documents upfront. It calls tools to retrieve relevant information on-demand, enabling it to work with unlimited documentation.

## File Structure

### Core Files
- `server.ts` - Main MCP server implementation (edit to add documents/products)
- `ollama-simple.ts` - Direct Ollama integration (no MCP, R0 cost)
- `ollama-simplified.ts` - **Enhanced** with simplified, jargon-free explanations
- `sa-medical-aid.ts` - **RECOMMENDED:** South African version (Rands, SA English, Medical Aid terms)
- `test-ollama.ts` - Quick test script for Ollama integration
- `test-simplified.ts` - Demo showing simplified vs. technical answers
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration (ES2022, Node16 modules)
- `setup.sh` - Automated setup script

### Data Files
- `documents-sa.ts` - **South African** medical aid plans (Rands, SA terminology)
- `insurance-glossary-sa.ts` - **SA Medical Aid** jargon dictionary (25+ terms)
- `insurance-jargon-glossary.ts` - Generic insurance glossary

### Example/Reference Files (Not Built)
- `production-example.ts` - Example upgrade to vector database (ChromaDB/Pinecone)
- `web-interface-example.ts` - Example web UI + Slack/Teams integration
- `ollama-with-web-search.ts` - Template for adding internet search capability

### Documentation
- `README.md` - Complete technical documentation
- `DECISION_GUIDE.md` - RAG vs fine-tuning comparison
- `PROJECT_OVERVIEW.md` - File structure and learning path
- `ARCHITECTURE_DIAGRAMS.md` - System architecture diagrams
- `CHEAT_SHEET.md` - Quick reference guide
- `OLLAMA_QUICKSTART.md` - Ollama setup and testing guide
- `SETUP_SA.md` - **South African** quick start guide
- `SUMMARY.md` - **Complete project summary** with all features
- `CLAUDE.md` - This file

**Note:** Example files are excluded from the build since they require additional dependencies. They serve as reference implementations.

## Common Tasks

### Adding Documents

Edit `server.ts` around line 38 in the `documentsDB` array:

```typescript
{
  id: "doc-unique-id",
  title: "Document Title",
  content: `Full document text content here...`,
  category: "category_name", // Used for filtering
  metadata: { key: "value" } // Custom fields
}
```

**Important:**
- Content should be comprehensive - this is what Claude reads
- Categories must match tool schema enums (line ~170)
- After adding documents: `npm run build` then restart Claude Desktop

### Adding Products

Edit `server.ts` around line 125 in the `productsDB` array:

```typescript
{
  id: "prod-unique-id",
  name: "Product Name",
  type: "insurance_type",
  premium_monthly: number,
  deductible: number,
  coverage_max: number,
  key_features: ["Feature 1", "Feature 2"]
}
```

### Adding New Tools

1. Add tool definition to `ListToolsRequestSchema` handler (~line 170)
2. Add implementation to `CallToolRequestSchema` handler (~line 210)
3. Rebuild and restart Claude Desktop

### Scaling to Production

When ready to handle 100+ documents:

1. **Vector Database Setup** (see `production-example.ts`)
   - ChromaDB (local/self-hosted)
   - Pinecone (managed service)
   - Weaviate (open-source)
   - PostgreSQL + pgvector

2. **Replace Simple Search**
   - Generate embeddings with OpenAI/Cohere
   - Store in vector DB
   - Update `search_documentation` to query vector DB
   - Enables semantic search (meaning-based, not keyword-based)

3. **Web Interface** (see `web-interface-example.ts`)
   - Express.js backend
   - Claude API integration
   - Authentication + rate limiting
   - Slack/Teams/WhatsApp bot examples included

## Configuration

### Claude Desktop Setup

**Location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Configuration:**
```json
{
  "mcpServers": {
    "insurance-docs": {
      "command": "node",
      "args": ["/absolute/path/to/insurance-simplified/build/server.js"]
    }
  }
}
```

**Critical:** Must use absolute path, not relative path.

## Design Patterns

### RAG Pattern (Core Architecture)

This project uses RAG instead of fine-tuning because:
- ✅ Real-time updates (change doc → instant changes)
- ✅ Source citations (verifiable answers)
- ✅ Cost-effective (R5,400-27,000/month vs R900K+/year)
- ✅ Accurate (AI reads current docs, not memories)
- ✅ Auditable (can verify every answer)

**When modifying:** Keep documents focused and well-structured. Quality of answers depends on quality of document organization, not AI training.

### Tool Design Pattern

Each tool follows this pattern:
1. Validate input parameters
2. Search/query relevant data
3. Format results for Claude
4. Return structured response with metadata

**Best practice:** Tools should return focused, relevant data. Don't return entire database - return top N results with enough context.

### Resource vs Tool Pattern

- **Resources** (`insurance://documents/{id}`): For direct document access when ID is known
- **Tools** (`search_documentation`): For discovery when ID is unknown

Both patterns serve different use cases in the RAG workflow.

## Important Constraints

1. **In-Memory Limitations**
   - Current implementation: ~100 documents maximum
   - Simple text search (keyword matching only)
   - No persistence across restarts
   - For production: Must upgrade to vector DB + SQL

2. **Search Quality**
   - Simple `includes()` matching (server.ts:~215)
   - Case-insensitive but keyword-dependent
   - Upgrade to vector search for semantic matching

3. **TypeScript Module System**
   - Uses ES modules (`"type": "module"` in package.json)
   - Imports must include `.js` extension even for `.ts` files
   - Node16 module resolution

## Troubleshooting

**Server won't start:**
```bash
rm -rf node_modules package-lock.json build
npm install
npm run build
```

**Build fails with "Cannot find module 'chromadb'" or similar:**
- This is expected - the example files need additional dependencies
- Solution: Ensure `tsconfig.json` includes only `server.ts` and excludes example files
- The examples are reference implementations, not part of the main build

**Claude Desktop doesn't see server:**
- Verify config path is absolute
- Check Node.js version ≥18
- Restart Claude Desktop
- Check logs: Help → View Logs

**Search returns no results:**
- Check document content has relevant keywords
- Simplify query (current search is basic text matching)
- Add more documents
- Consider upgrading to vector search

**Build errors:**
- Check TypeScript version: `npm list typescript`
- Verify tsconfig.json includes only server.ts (not example files)
- Check for syntax errors in server.ts

## Development Workflow

1. Make changes to `server.ts` (or other .ts files)
2. Build: `npm run build`
3. Restart Claude Desktop
4. Test with queries in Claude Desktop
5. Iterate

**Tip:** Use `npm run watch` during development for auto-rebuild on file changes.

## Cost Estimates

**Current (local):** R0/month

**Production (100 employees, 5K queries/day):**
- Claude API: ~R9,000/month
- Vector DB (Pinecone): ~R3,600/month
- Hosting: ~R1,800/month
- OpenAI embeddings: ~R900/month
- **Total: ~R15,300/month**

## Ollama Integration (Local AI Option)

### Quick Start
```bash
# 1. Ensure Ollama is installed and running
ollama list  # Check models

# 2. Pull a model if needed
ollama pull llama3.1:8b  # or llama3.2, mistral, phi3

# 3. Test the integration
npm run test-ollama

# 4. Run interactive mode
npm run ollama
```

### Key Differences: MCP vs Ollama

| Aspect | MCP + Claude | Direct + Ollama |
|--------|--------------|-----------------|
| **Cost** | ~R9,000/mo (5K queries) | R0 |
| **Setup** | Claude Desktop config | Ollama install |
| **Quality** | Excellent | Good |
| **Speed** | ~2 seconds | ~5-10 seconds |
| **Privacy** | Cloud | 100% Local |
| **Best for** | Production | Development/MVP |

### When to Use Which

**Use MCP + Claude:**
- Production deployment
- Need best quality answers
- Team-wide access via Claude Desktop
- Budget available (~R9,000/mo)

**Use Ollama:**
- Development and testing
- MVP/prototype phase
- Cost-sensitive projects
- Privacy requirements (local only)
- No internet access scenarios

**Hybrid Approach (Recommended):**
- Develop with Ollama (R0)
- Test with real users
- Deploy to production with Claude (better quality)
- Keep Ollama for staging/testing

### File Locations

- `ollama-simple.ts` - Main Ollama integration (220 lines, self-contained)
- `test-ollama.ts` - Quick test script
- `OLLAMA_QUICKSTART.md` - Full setup guide with examples

## Additional Context

- **RAG vs Fine-tuning:** Read `DECISION_GUIDE.md` for detailed comparison
- **Architecture diagrams:** See `ARCHITECTURE_DIAGRAMS.md`
- **Quick reference:** See `CHEAT_SHEET.md`
- **Ollama setup:** See `OLLAMA_QUICKSTART.md` for local AI testing
- **MCP Protocol:** This server implements MCP specification for Claude integration
- **Production examples:** Both `production-example.ts` and `web-interface-example.ts` are reference implementations, not active code

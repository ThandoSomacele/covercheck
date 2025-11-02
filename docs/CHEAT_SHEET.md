# 🚀 Quick Reference Cheat Sheet

## ⚡ 5-Minute Quick Start

```bash
# 1. Setup
cd insurance-simplified
./setup.sh

# 2. Configure Claude Desktop
# macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
# Windows: %APPDATA%\Claude\claude_desktop_config.json
# Add:
{
  "mcpServers": {
    "insurance-docs": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/insurance-simplified/build/server.js"]
    }
  }
}

# 3. Restart Claude Desktop

# 4. Test
# Ask Claude: "What does Health Plan A cover?"
```

## 📝 Common Tasks

### Add Your Own Document

**File:** `server.ts` (line ~40)

```typescript
{
  id: "doc-your-id",
  title: "Your Document Title",
  content: `Your full document content...`,
  category: "your_category",
  metadata: { key: "value" }
}
```

### Add Your Own Product

**File:** `server.ts` (line ~125)

```typescript
{
  id: "prod-your-id",
  name: "Product Name",
  type: "insurance_type",
  premium_monthly: 299,
  deductible: 1000,
  coverage_max: 5000,
  key_features: ["Feature 1", "Feature 2"]
}
```

### Rebuild After Changes

```bash
npm run build
# Then restart Claude Desktop
```

### Test Server Manually

```bash
# Start server
npm start

# In another terminal, test it:
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm start
```

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Server won't start | `rm -rf node_modules && npm install && npm run build` |
| Claude doesn't see server | Check config path is absolute, restart Claude |
| "Node not found" | Install Node.js 18+ from nodejs.org |
| Build errors | Check TypeScript version: `npm list typescript` |
| Search returns nothing | Add more documents or simplify query |

## 📊 File Reference

| File | Purpose | When to Edit |
|------|---------|--------------|
| `server.ts` | Main server | Add documents/products |
| `package.json` | Dependencies | Add new npm packages |
| `tsconfig.json` | TypeScript | Rarely (default is fine) |
| `production-example.ts` | Vector DB guide | When scaling |
| `web-interface-example.ts` | Web app guide | Building web UI |
| `README.md` | Documentation | Never (read only) |
| `DECISION_GUIDE.md` | Why RAG | Never (read only) |

## 🎯 Example Queries to Test

```
"What does Health Plan A cover?"
"Compare Health Plan A and Health Plan B"
"What's the deductible for the cheapest plan?"
"How do I file a dental claim?"
"What's the total annual cost of Plan A if I use healthcare a lot?"
"Which plan is better for someone healthy?"
"What's covered for emergency room visits?"
"Show me all health insurance products under R7,200/month"
```

## 🔄 Development Workflow

```bash
# 1. Make changes to server.ts
vim server.ts

# 2. Rebuild
npm run build

# 3. Test manually (optional)
npm start
# (Press Ctrl+C to stop)

# 4. Restart Claude Desktop

# 5. Test in Claude Desktop
# Ask a question to verify changes

# 6. Iterate
```

## 📈 Scaling Checklist

When you're ready to scale:

- [ ] Set up vector database (ChromaDB/Pinecone)
- [ ] Implement embeddings (OpenAI/Cohere)
- [ ] Replace `searchDocuments()` with `searchVectorDB()`
- [ ] Add document processing pipeline
- [ ] Set up PostgreSQL for structured data
- [ ] Build web interface
- [ ] Add authentication
- [ ] Implement rate limiting
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Deploy to cloud (Railway, Render, AWS)

## 💰 Cost Calculator

```
Small (10 employees, 500 queries/day):
- Claude API: R2,700
- ChromaDB: R900
- Hosting: R900
= R4,500/month

Medium (100 employees, 5,000 queries/day):
- Claude API: R9,000
- Pinecone: R3,600
- Hosting: R1,800
- OpenAI embeddings: R900
= R15,300/month

Large (1,000 employees, 50,000 queries/day):
- Claude API: R36,000
- Pinecone: R9,000
- Hosting: R5,400
- OpenAI embeddings: R1,800
- Caching: R1,800
= R54,000/month
```

## 🎓 Learning Resources

| Topic | Resource |
|-------|----------|
| MCP Protocol | https://modelcontextprotocol.io |
| Claude API | https://docs.anthropic.com |
| RAG Tutorial | https://docs.anthropic.com/en/docs/build-with-claude/rag |
| Vector DBs | https://www.pinecone.io/learn/ |
| Prompt Engineering | https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering |

## 🐛 Debug Commands

```bash
# Check Node version
node --version

# Check npm version
npm --version

# View package versions
npm list

# Clean build
rm -rf build && npm run build

# Run with debug output
DEBUG=* npm start

# Check TypeScript errors
npx tsc --noEmit

# Format code
npx prettier --write "*.ts"

# Check for issues
npx eslint "*.ts"
```

## 🔐 Production Security

```typescript
// Add to server before starting
const API_KEY = process.env.MCP_API_KEY;

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Validate API key
  if (request.params.meta?.apiKey !== API_KEY) {
    throw new Error("Unauthorized");
  }
  // ... rest of handler
});
```

## 📱 Integration Patterns

### Slack Bot
```bash
npm install @slack/bolt
# See web-interface-example.ts for code
```

### REST API
```bash
npm install express cors
# See web-interface-example.ts for code
```

### Direct Claude API
```bash
npm install @anthropic-ai/sdk
# See web-interface-example.ts for code
```

## 🎨 Customization Ideas

- [ ] Add more insurance types (auto, home, etc.)
- [ ] Implement claims history tracking
- [ ] Add multi-language support
- [ ] Create PDF export functionality
- [ ] Build recommendation engine
- [ ] Add email integration
- [ ] Implement audit logging
- [ ] Create admin dashboard

## ⚖️ Decision Matrix

| If You... | Then... |
|-----------|---------|
| Have < 100 documents | Use current simple search |
| Have 100-10,000 documents | Upgrade to vector DB |
| Need web interface | Use web-interface-example.ts |
| Need team-wide access | Build Slack/Teams bot |
| Need customer-facing | Add authentication + web UI |
| Data highly confidential | Self-host everything |
| Want fastest setup | Use managed services (Pinecone, Railway) |

## 🎯 Success Criteria

Track these metrics:

```typescript
// Add to your server
let metrics = {
  totalQueries: 0,
  successfulQueries: 0,
  averageLatency: 0,
  toolUsage: {
    search_documentation: 0,
    query_products: 0,
    compare_plans: 0,
    calculate_annual_cost: 0
  }
};
```

## 🚨 Common Mistakes to Avoid

❌ **Don't:**
- Use relative paths in config
- Forget to rebuild after changes
- Put secrets in code
- Deploy without authentication
- Ignore error logs

✅ **Do:**
- Use absolute paths
- Rebuild after every change
- Use environment variables
- Add auth in production
- Monitor logs regularly

## 📞 Getting Help

1. **Check logs:** Claude Desktop → Help → View Logs
2. **Test manually:** `npm start` and check output
3. **Read errors:** Error messages are usually helpful
4. **Search docs:** MCP and Claude documentation
5. **Ask community:** Anthropic Discord, Reddit

## 🎉 Next Level Features

Once basics work:

```typescript
// Add these features:
- Caching (Redis)
- Analytics (Mixpanel)
- A/B testing
- Multi-tenancy
- Role-based access
- Document versioning
- Audit trails
- API rate limiting
- Backup strategy
- Disaster recovery
```

---

## 🌟 Final Checklist

Before going live:

- [ ] Tested with 10+ real queries
- [ ] Added authentication
- [ ] Set up monitoring
- [ ] Documented for team
- [ ] Created runbook
- [ ] Tested failure scenarios
- [ ] Set up backup
- [ ] Configured rate limits
- [ ] Added usage tracking
- [ ] Trained initial users

**You're ready to ship!** 🚀

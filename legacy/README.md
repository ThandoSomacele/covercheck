# Legacy Implementations

This directory contains previous implementations of the insurance assistant that have been superseded by the unified SvelteKit application in the project root.

## Files in This Directory

### Core Logic Files (Now in ../src/lib/insurance/)
- **`documents-sa.ts`** - South African medical aid documents and plans (now in `../src/lib/insurance/`)
- **`insurance-glossary-sa.ts`** - SA-specific glossary and simplification prompts (now in `../src/lib/insurance/`)
- **`insurance-jargon-glossary.ts`** - Generic insurance glossary (now in `../src/lib/insurance/`)

### MCP Server Implementation
- **`server.ts`** - Model Context Protocol server for Claude Desktop integration
  - Provides tools: `search_documentation`, `query_products`, `compare_plans`, `calculate_annual_cost`
  - Can still be used with Claude Desktop if preferred
  - Setup instructions in parent README (original version)

### CLI Implementations
- **`ollama-simple.ts`** - Basic CLI using Ollama (fast, direct answers)
- **`ollama-simplified.ts`** - CLI with simplified, structured responses
- **`sa-medical-aid.ts`** - South African-focused CLI with medical aid terminology

### Test Scripts
- **`test-ollama.ts`** - Test script for Ollama connection
- **`test-simplified.ts`** - Demo showing simplified vs. technical answers

## Why These Are Legacy

The project has been restructured as a unified SvelteKit application with:

1. **Better Organization** - Proper separation of client/server code
2. **Modern UI** - Web-based chat interface instead of CLI
3. **Single Package** - One `package.json` instead of duplicates
4. **Reusable Logic** - Centralized RAG logic in `src/lib/server/rag.ts`
5. **Easier Deployment** - Standard SvelteKit deployment options

## Can I Still Use These?

Yes! If you prefer the CLI or MCP server approach:

### Using the MCP Server

1. Make sure dependencies are installed in parent directory:
   ```bash
   cd ..
   npm install
   npm run build
   ```

2. Configure Claude Desktop (see original README)

3. The server will work independently of the SvelteKit app

### Using the CLI Tools

The CLI tools can be run directly:

```bash
# From parent directory
npm run build

# Run CLI tools (if you add npm scripts)
node build/ollama-simple.js
node build/sa-medical-aid.js
```

## Migrating Forward

If you have custom changes in these legacy files, you can integrate them into the SvelteKit app:

1. **Insurance data changes** → Update `../src/lib/insurance/documents-sa.ts`
2. **Prompt changes** → Update `../src/lib/insurance/insurance-glossary-sa.ts`
3. **RAG logic changes** → Update `../src/lib/server/rag.ts`
4. **UI changes** → Update `../src/routes/+page.svelte`

## Support

For the current SvelteKit application:
- See `../README.md` for setup and usage
- Check `../docs/` for comprehensive documentation

For legacy implementations:
- Refer to the original README.md (now replaced)
- These are provided as-is for reference

---

**Recommendation:** Use the unified SvelteKit app in the project root for new development.

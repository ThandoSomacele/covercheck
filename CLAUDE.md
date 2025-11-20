# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CoverCheck is a South African medical aid assistant that uses RAG (Retrieval-Augmented Generation) to answer questions about medical aid plans from major SA providers. The system scrapes official documentation, processes it into a vector database, and uses semantic search with cloud LLMs to provide accurate, cited answers.

**Current Phase:** Phase 3 - Public Platform Development
**Target Providers:** Discovery Health, Bonitas Medical Fund, Momentum Health (+ GEMS, Medscheme, FedHealth planned)

## Development Commands

### Essential Commands
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check
npm run check:watch

# Database setup
psql $DB_CONNECTION_STRING -f scripts/migrate-db.sql
```

### Scraping Commands
```bash
# Scrape all providers
npm run scrape

# Scrape individual providers
npm run scrape:discovery
npm run scrape:bonitas
npm run scrape:momentum

# Data validation and analysis
npx tsx scripts/validate-content.ts
npx tsx scripts/analyze-scraped-data.ts
```

### Database & RAG Commands
```bash
# Load scraped documents into vector database
npx tsx scripts/load-documents.ts

# Load PDFs from specific providers
npx tsx scripts/load-bonitas-pdfs.ts
npx tsx scripts/load-discovery-pdfs.ts
npx tsx scripts/phase2-load-all-pdfs.ts

# Check database status and statistics
npx tsx scripts/check-db-stats.ts
npx tsx scripts/check-db-status.ts

# Test embeddings and queries
npx tsx scripts/test-ollama-embeddings.ts
npx tsx scripts/test-simple-query.ts
npx tsx scripts/test-comprehensive-coverage.ts

# Database maintenance
npx tsx scripts/clear-database.ts
npx tsx scripts/find-missing-chunks.ts
npx tsx scripts/reprocess-missing-chunks.ts
```

## Architecture

### Core System Components

**1. Web Scraping System** (`src/lib/server/scrapers/`)
- **BaseScraper.ts**: Abstract base class providing common scraping functionality (rate limiting, content extraction, browser management)
- **ScraperOrchestrator.ts**: Coordinates multiple scrapers, runs them sequentially or in parallel, aggregates results
- Provider-specific scrapers extend BaseScraper:
  - **DiscoveryHealthScraper.ts**: Scrapes Discovery Health documentation
  - **BonitasScraper.ts**: Scrapes Bonitas Medical Fund web pages
  - **MomentumHealthScraper.ts**: Scrapes Momentum Health documentation
  - **BonitasPDFScraper.ts**: Handles Bonitas PDF extraction
  - **DiscoveryPDFScraper.ts**: Handles Discovery PDF extraction

**Key scraping patterns:**
- Uses Playwright for JavaScript-heavy sites
- Implements rate limiting (configured per scraper)
- Graceful fallback for navigation failures (domcontentloaded → commit)
- Removes noise (scripts, styles, nav, headers, cookies) before extraction
- Outputs to `scraped-data/` directory (gitignored)

**2. Document Processing & Embedding** (`src/lib/server/document-processor.ts`)
- **DocumentProcessor class**: Handles the complete pipeline from raw documents to vector embeddings
- **Chunking strategy**: Recursive text splitting with configurable parameters
  - Target size: 4000 chars (~1000 tokens)
  - Max size: 6000 chars (~1500 tokens)
  - Overlap: 400 chars (~100 tokens)
  - Separator hierarchy: `\n\n\n` (sections) → `\n\n` (paragraphs) → `\n` (lines) → `. ` (sentences) → ` ` (words)
- **PDF extraction**: Uses `pdfreader` package to extract text from PDF files
- **Embedding generation**: Uses Ollama with `nomic-embed-text` model
- **Storage**: PostgreSQL with pgvector extension

**3. RAG System** (`src/lib/server/rag-semantic.ts`)
- **Semantic search** using pgvector cosine similarity
- **Query expansion**: Automatically expands queries with related medical aid terminology
  - Example: "pregnant" → adds "pregnancy", "maternity", "antenatal", "prenatal", "obstetric", "expecting", "baby"
- **Intent detection**: Identifies query type (pregnancy, chronic condition, emergency, hospital/procedure, general)
- **Re-ranking**: Boosts results based on keyword matching after vector similarity search
- **Citation system**: Tracks source documents with URLs for transparency
- **LLM integration**: Uses OpenRouter API with fallback model strategy
  - Free models tried in order: Gemini 2.0 Flash, Llama 3.1 8B, Mistral 7B, Gemini Flash 1.5
  - Automatic fallback on rate limits
- **Streaming support**: `queryInsuranceStream()` for real-time response streaming

**4. Database Schema**
- **documents table**: Stores original scraped documents with metadata
- **document_chunks table**: Stores text chunks with vector embeddings
  - Uses pgvector extension for similarity search
  - Includes denormalized fields (provider, document_title, document_url) for efficient retrieval

### Frontend Structure

**SvelteKit 5 with modern UI:**
- `src/routes/+page.svelte`: Main chat interface
- `src/routes/+layout.svelte`: App layout with theme support
- `src/routes/api/chat/+server.ts`: API endpoint for chat queries
- `src/lib/components/ThemeToggle.svelte`: Dark/light mode toggle
- `src/lib/stores/theme.ts`: Theme state management using Svelte 5 runes

### Data Flow

1. **Scraping**: `scripts/scrape.ts` → Orchestrator → Provider Scrapers → JSON output in `scraped-data/`
2. **Processing**: `scripts/load-documents.ts` → DocumentProcessor → Chunks documents → Generates embeddings → Stores in PostgreSQL
3. **Query**: User question → Frontend → API endpoint → RAG system:
   - Expands query with synonyms
   - Generates query embedding
   - Performs vector similarity search
   - Re-ranks results based on intent
   - Sends context + query to LLM
   - Returns answer with source citations

## Environment Setup

Required environment variables (`.env` file, never commit):
```env
# PostgreSQL database with pgvector extension
DB_CONNECTION_STRING=postgresql://user:password@host:port/database

# OpenRouter API key for cloud LLM access
OPENROUTER_API_KEY=sk-or-v1-your_api_key_here
```

**Security requirements:**
- NEVER hardcode API keys or database credentials
- Always use environment variables
- `.env` is gitignored - use `.env.example` as template

## Testing and Validation

### Quality Assurance
- **Content validation**: `scripts/validate-content.ts` checks scraped content quality
- **Data analysis**: `scripts/analyze-scraped-data.ts` provides statistics on scraped documents
- **Quality metrics tracked**:
  - Document count and average content length
  - Medical terminology presence
  - Content type coverage
  - URL verification (no 404s)

### Database Testing
- **Check stats**: Verify document and chunk counts per provider
- **Test queries**: Validate semantic search and RAG responses
- **Coverage testing**: Ensure all major medical aid topics are covered

## Common Development Patterns

### Adding a New Scraper
1. Create new class in `src/lib/server/scrapers/` extending `BaseScraper`
2. Implement `scrape()` method with provider-specific logic
3. Define `ScraperConfig` with targets, selectors, and rate limits
4. Register in `ScraperOrchestrator.ts`
5. Add npm script in `package.json`
6. Test with `npm run scrape:<provider>`

### Processing New Documents
1. Scrape documents: `npm run scrape:<provider>`
2. Load into database: `npx tsx scripts/load-documents.ts`
3. Verify: `npx tsx scripts/check-db-stats.ts`
4. Test retrieval: `npx tsx scripts/test-simple-query.ts`

### Working with PDFs
- PDFs are extracted using `pdfreader` package
- Text extraction happens in `DocumentProcessor.extractPdfText()`
- PDF scrapers download files to temp location, then DocumentProcessor extracts text
- Extracted text is chunked and embedded like web-scraped content

## South African Context

This is a South African medical aid assistant. Important terminology:
- Use "medical aid" not "health insurance"
- Currency in Rands (R), not dollars
- SA English spelling (e.g., "honour", "colour")
- Provider-specific terms (e.g., Discovery's "KeyCare", Bonitas's "BonComprehensive")
- Medical aid vocabulary (PMBs, CDL, hospital plan, comprehensive plan, medical savings account, etc.)

## Project Roadmap Context

**Completed:**
- ✅ Phase 1: High-quality scraping from top 3 providers (23/26 documents, 88% quality)
- ✅ Phase 2: PostgreSQL + pgvector database, semantic search, cloud LLM integration, streaming
- ✅ Phase 3: Public Platform Development
  - Provider selector component with all 3 providers
  - Enhanced citation display with relevance scores and color-coded indicators
  - CoverCheck branding (shield-checkmark logo, custom favicon, page metadata)
  - Responsive design optimized for mobile and tablet devices

**Current (Phase 4 - Expansion & Deployment):**
- Scrape remaining providers (GEMS, Medscheme, FedHealth)
- Deployment preparation (Vercel + Railway/Supabase)
- Performance optimization
- Testing and quality assurance

**Next:**
- Automated content updates and refresh system
- Rate limiting and usage analytics
- User feedback system
- SEO optimization

## Important Notes

- **Playwright browser**: May need installation via `npx playwright install chromium`
- **Ollama dependency**: Local Ollama server must be running for embeddings (`ollama serve`)
  - Model required: `nomic-embed-text` (`ollama pull nomic-embed-text`)
- **pgvector**: PostgreSQL database must have pgvector extension enabled
- **Scraped data**: Output is gitignored; stored in `scraped-data/` directory
- **Legacy code**: Old implementations in `legacy/` directory for reference only
- **Learning mode**: User wants to learn about Document Collection, Vector Databases, and RAG - explain concepts when working on these areas

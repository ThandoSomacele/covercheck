# 🇿🇦 CoverCheck - Medical Aid Assistant

**Your South African medical aid questions answered with accurate, up-to-date information.**

A modern AI-powered medical aid assistant that helps South Africans understand and compare medical aid plans from the top 3 providers. Built with quality data, semantic search, and RAG (Retrieval-Augmented Generation).

## 🎯 Project Status

**✅ Phase 3 Complete:** Production-ready medical aid assistant with modern UI

- ✅ **Phase 1:** High-quality scraping from top 3 providers (23/26 documents, 88% quality)
- ✅ **Phase 2:** PostgreSQL + pgvector database, semantic search, cloud LLM integration
- ✅ **Phase 3:** Public platform with provider selector, enhanced citations, responsive design
- 🔄 **Phase 4 (Current):** Deployment preparation and optimization

The application is functional and ready for testing!

## ✨ Features

### Current Features
- 🏥 **Top 3 SA Providers** - Discovery Health, Bonitas Medical Fund, Momentum Health
- 💬 **AI-Powered Chat** - Ask questions in natural language, get accurate answers
- 🔍 **Semantic Search** - Query expansion and intent detection for better results
- 📚 **Source Citations** - Every answer backed by official documentation with links
- 🎨 **Modern UI** - Next.js/Vercel-inspired design with dark mode
- 📱 **Responsive** - Optimized for desktop, tablet, and mobile
- 🎯 **Provider Filter** - Search across all providers or focus on one
- ⚡ **Real-time Streaming** - Answers stream in as they're generated
- 🇿🇦 **SA Context** - Rands (R), SA English spelling, and medical aid terminology

### Technical Features
- 🗄️ **Vector Database** - PostgreSQL with pgvector for semantic search
- 🤖 **RAG System** - Retrieval-Augmented Generation with cloud LLMs
- 🔄 **Fallback Strategy** - Multiple LLM models (Gemini, Llama, Mistral)
- 🎭 **Smart Re-ranking** - Intent-based result boosting
- 📊 **Query Expansion** - Automatic synonym and related term expansion

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL with pgvector extension (for Phase 2+)
- Ollama (for local embeddings)

### Installation

```bash
# Clone the repository
git clone https://github.com/ThandoSomacele/covercheck.git
cd covercheck

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys and database connection string
```

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
DB_CONNECTION_STRING=postgresql://user:password@host:port/database

# OpenRouter API Configuration
OPENROUTER_API_KEY=sk-or-v1-your_api_key_here
```

**⚠️ SECURITY WARNING:**
- **NEVER commit your `.env` file to git**
- **NEVER hardcode API keys or secrets in source code**
- The `.env` file is already in `.gitignore` for your protection
- Use `.env.example` as a template (it contains no real secrets)

### Running the Application

```bash
# Start the development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Database Setup

```bash
# Set up the database schema
psql $DB_CONNECTION_STRING -f scripts/db-setup.sql

# Load scraped documents into the database
npx tsx scripts/load-documents.ts

# Verify data loaded correctly
npx tsx scripts/check-db-stats.ts

# Optimize database performance
psql $DB_CONNECTION_STRING -f scripts/optimize-db.sql
```

### Scraping (Optional)

```bash
# Scrape all 3 providers
npm run scrape

# Scrape individual providers
npm run scrape:discovery
npm run scrape:bonitas
npm run scrape:momentum
```

## 📁 Project Structure

```
covercheck/
├── src/
│   ├── lib/
│   │   ├── insurance/              # Static insurance data
│   │   │   ├── documents-sa.ts     # SA medical aid documents
│   │   │   └── insurance-*-glossary.ts
│   │   └── server/
│   │       ├── rag.ts              # RAG logic (future)
│   │       └── scrapers/           # Web scraping system
│   │           ├── BaseScraper.ts
│   │           ├── DiscoveryHealthScraper.ts
│   │           ├── BonitasScraper.ts
│   │           ├── MomentumHealthScraper.ts
│   │           └── ScraperOrchestrator.ts
│   └── routes/
│       ├── +page.svelte            # Chat UI (future)
│       └── api/chat/+server.ts     # API endpoint (future)
├── scripts/                         # Utility scripts
│   ├── scrape.ts                   # Main scraping CLI
│   ├── validate-content.ts         # Quality validation
│   └── analyze-scraped-data.ts     # Data analysis
├── docs/                            # Complete documentation
│   ├── README.md                   # Documentation index
│   ├── SCRAPING.md                 # Scraping system guide
│   ├── VERIFIED_URLS.md            # Verified provider URLs
│   └── SCRAPER_FIX_PLAN.md         # Quality improvement process
├── scraped-data/                    # JSON output (gitignored)
├── legacy/                          # Old implementations
└── COVERCHECK_ROADMAP.md           # Development roadmap
```

## 📊 Data Quality

### Current Scrape Results

| Provider | Documents | Quality Rate | Avg. Content |
|----------|-----------|--------------|--------------|
| Discovery Health | 13/14 | 93% | 10,000 chars |
| Momentum Health | 9/10 | 90% | 10,500 chars |
| Bonitas Medical Fund | 1/2 | 50% | 193,754 chars |
| **Total** | **23/26** | **88%** | **~10,000 chars** |

### Content Coverage

✅ **Plan Information**
- All major plans from each provider
- Plan benefits and exclusions
- Coverage details

✅ **Benefits Documentation**
- Hospital benefits
- Day-to-day benefits
- Chronic illness benefits

✅ **Support Information**
- Claims processes
- Comparison tools
- Contact information

## 🛠️ Development Roadmap

### ✅ Phase 1: Data Scraping (Complete)
- [x] Research and verify provider URLs
- [x] Build scraping system with Playwright
- [x] Implement quality validation
- [x] Scrape top 3 SA providers
- [x] Achieve 20+ quality documents

### ✅ Phase 2: Database & RAG (Complete)
- [x] Set up PostgreSQL + pgvector
- [x] Design database schema
- [x] Process and chunk documents
- [x] Generate embeddings with Ollama
- [x] Implement semantic search with query expansion
- [x] Build RAG pipeline with cloud LLMs
- [x] Implement streaming responses
- [x] Add source citations

### ✅ Phase 3: Public Platform (Complete)
- [x] Modern SvelteKit UI with dark mode
- [x] Provider selector component
- [x] Enhanced citation display with relevance scores
- [x] Responsive design for mobile/tablet
- [x] CoverCheck branding and logo

### 🔄 Phase 4: Deployment Preparation (Current)
- [x] Production environment configuration
- [x] Database optimization and indexes
- [x] Error handling improvements
- [x] Deployment documentation
- [ ] Analytics tracking
- [ ] Final testing and QA

### 📅 Phase 5: Production Launch (Next)
- [ ] Deploy to Vercel + Railway/Supabase
- [ ] Monitor performance and errors
- [ ] Collect user feedback
- [ ] Content update automation

See [CLAUDE.md](CLAUDE.md) and [DEPLOYMENT.md](DEPLOYMENT.md) for detailed information.

## 📚 Documentation

All documentation is in the [`docs/`](docs/) directory:

- **[docs/README.md](docs/README.md)** - Documentation index
- **[docs/SCRAPING.md](docs/SCRAPING.md)** - Complete scraping guide
- **[docs/VERIFIED_URLS.md](docs/VERIFIED_URLS.md)** - Working provider URLs
- **[docs/SCRAPER_FIX_PLAN.md](docs/SCRAPER_FIX_PLAN.md)** - Quality improvement process
- **[docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)** - Project goals and architecture
- **[docs/SETUP_SA.md](docs/SETUP_SA.md)** - SA-specific setup guide

## 🧪 Technology Stack

**Current:**
- **SvelteKit** - Full-stack framework
- **TypeScript** - Type safety
- **Playwright** - Web scraping
- **Cheerio** - HTML parsing

**Planned:**
- **PostgreSQL + pgvector** - Vector database
- **Ollama** - Local AI model runner
- **OpenRouter** - Cloud AI API (alternative)
- **Svelte 5** - Reactive UI

## 🔧 Adding New Providers

Want to add another medical aid provider? See the [Adding New Scrapers](docs/SCRAPING.md#adding-new-scrapers) guide.

Quick overview:
1. Create a new scraper class extending `BaseScraper`
2. Define target URLs and selectors
3. Register in `ScraperOrchestrator`
4. Test and validate quality

## 🤝 Contributing

This is a learning project documenting the journey of building a production RAG system. Contributions, suggestions, and feedback are welcome!

## 📝 License

See LICENSE file for details.

## 🙏 Acknowledgments

Built with:
- [SvelteKit](https://kit.svelte.dev/)
- [Playwright](https://playwright.dev/)
- [Cheerio](https://cheerio.js.org/)

Data sourced from:
- [Discovery Health](https://www.discovery.co.za/medical-aid)
- [Bonitas Medical Fund](https://www.bonitas.co.za)
- [Momentum Health](https://www.momentum.co.za)

---

**Made with ❤️ for South Africans who deserve simple, accurate medical aid information.**

**Current Version:** Phase 3 Complete (Production-Ready)
**Last Updated:** 2025-11-20

# 🇿🇦 CoverCheck - Medical Aid Assistant

**Your South African medical aid questions answered with accurate, up-to-date information.**

A modern AI-powered medical aid assistant that helps South Africans understand and compare medical aid plans from the top 3 providers. Built with quality data, semantic search, and RAG (Retrieval-Augmented Generation).

## 🎯 Project Status

**✅ Phase 1 Complete:** High-quality data scraping from top 3 SA medical aid providers

- **23 verified documents** from Discovery Health, Bonitas Medical Fund, and Momentum Health
- **88% quality rate** with comprehensive plan and benefits information
- **Zero 404 errors** - all URLs verified and working
- Ready for Phase 2: Database Setup

**🔄 Phase 2 Next:** PostgreSQL + pgvector database setup for semantic search

## ✨ Features

### Current (Phase 1)
- 🏥 **Top 3 SA Providers** - Discovery Health, Bonitas Medical Fund, Momentum Health
- 📊 **Comprehensive Coverage** - All major plans, benefits, and claims information
- ✅ **Quality Validated** - Medical terminology verified, content accuracy confirmed
- 🔍 **Smart Scraping** - Resilient scraper with rate limiting and error recovery

### Coming Soon (Phase 2+)
- 🗄️ **Vector Database** - PostgreSQL + pgvector for semantic search
- 🤖 **RAG System** - Accurate answers backed by real documentation
- 🌐 **Web Interface** - Modern SvelteKit chat UI
- 🇿🇦 **SA Context** - Rands (R), SA English, and medical aid terminology

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

### Running the Scrapers

```bash
# Scrape all 3 providers
npm run scrape

# Scrape individual providers
npm run scrape:discovery
npm run scrape:bonitas
npm run scrape:momentum

# Analyze data quality
npx tsx scripts/validate-content.ts
npx tsx scripts/analyze-scraped-data.ts
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

### 🔄 Phase 2: Database Setup (Next)
- [ ] Set up PostgreSQL + pgvector
- [ ] Design database schema
- [ ] Process and chunk documents
- [ ] Generate embeddings
- [ ] Implement semantic search

### 📅 Phase 3: RAG Implementation
- [ ] Build RAG pipeline
- [ ] Integrate with Ollama/OpenRouter
- [ ] Implement query processing
- [ ] Add source citations

### 📅 Phase 4: Web Interface
- [ ] SvelteKit frontend
- [ ] Chat UI with message history
- [ ] API endpoints
- [ ] User authentication
- [ ] Deploy to production

See [`COVERCHECK_ROADMAP.md`](COVERCHECK_ROADMAP.md) for detailed roadmap.

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

**Current Version:** Phase 1 Complete
**Last Updated:** 2025-11-07

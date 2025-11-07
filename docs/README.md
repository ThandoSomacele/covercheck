# 📚 CoverCheck Documentation

This directory contains all documentation for the CoverCheck project - a South African medical aid comparison and information assistant.

## 📑 Documentation Index

### Getting Started
- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - High-level project goals, architecture, and technology stack
- **[SETUP_SA.md](SETUP_SA.md)** - Quick start guide for South African context

### Development Guides
- **[SCRAPING.md](SCRAPING.md)** - Complete guide to the medical aid scraping system
  - Architecture and components
  - Usage instructions
  - Adding new scrapers
  - Best practices

- **[VERIFIED_URLS.md](VERIFIED_URLS.md)** - Researched and verified URLs for all providers
  - Discovery Health URLs
  - Bonitas Medical Fund URLs
  - Momentum Health URLs
  - Scraping strategies per provider

- **[SCRAPER_FIX_PLAN.md](SCRAPER_FIX_PLAN.md)** - Documentation of quality improvement process
  - Problem statement
  - Research methodology
  - Implementation steps
  - Success metrics

### Working with Claude Code
- **[CLAUDE.md](CLAUDE.md)** - Instructions for Claude Code AI assistant
  - Project structure
  - Common tasks
  - Development workflows

## 🗂️ Documentation by Phase

### ✅ Phase 1: Data Scraping (Complete)
- [SCRAPING.md](SCRAPING.md) - System overview
- [VERIFIED_URLS.md](VERIFIED_URLS.md) - Working URLs
- [SCRAPER_FIX_PLAN.md](SCRAPER_FIX_PLAN.md) - Quality improvement process

### 🔄 Phase 2: Database Setup (Next)
- PostgreSQL + pgvector setup (coming soon)
- Document processing and chunking
- Embedding generation

### 📅 Phase 3: RAG Implementation (Planned)
- Vector search implementation
- RAG pipeline
- Query processing

### 📅 Phase 4: Web Interface (Planned)
- SvelteKit frontend
- API endpoints
- User authentication

## 🎯 Quick Links by Task

**Want to...**
- **Understand the project?** → [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- **Run the scrapers?** → [SCRAPING.md](SCRAPING.md)
- **Add a new provider?** → [SCRAPING.md#adding-new-scrapers](SCRAPING.md#adding-new-scrapers)
- **Find working URLs?** → [VERIFIED_URLS.md](VERIFIED_URLS.md)
- **Work with Claude?** → [CLAUDE.md](CLAUDE.md)

## 📊 Project Status

**Current Phase:** Phase 1 Complete ✅
**Next Phase:** Database Setup (Phase 2)

### Phase 1 Achievements
- ✅ 23 high-quality documents scraped (88% success rate)
- ✅ Top 3 SA medical aid providers covered
- ✅ Zero 404 errors
- ✅ All major plans documented
- ✅ Content validation system implemented

## 🔄 Keeping Documentation Updated

When working on the project:
1. Update relevant docs when making changes
2. Keep the roadmap (`../COVERCHECK_ROADMAP.md`) current
3. Document new scrapers in VERIFIED_URLS.md
4. Update this index when adding new docs

## 📝 Documentation Standards

- Use Markdown formatting
- Include code examples where relevant
- Keep technical accuracy high (especially for medical aid info)
- Update modification dates on significant changes
- Cross-reference related documents

---

**Last Updated:** 2025-11-07
**Version:** Phase 1 Complete

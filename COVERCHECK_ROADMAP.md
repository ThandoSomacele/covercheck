# 🏥 CoverCheck Development Roadmap

**Transforming Insurance Assistant into a Public Medical Aid Information Platform**

Last Updated: 2025-11-19
Status: Phase 2 Complete, Phase 3 In Progress
Target: Public Production Launch

---

## 📊 Project Overview

CoverCheck will be a public platform where South Africans can ask questions about medical aid and insurance plans, receiving accurate answers with citations from official sources.

### Initial Focus: 5 Medical Aid Providers
1. **Discovery Health** - discovery.co.za
2. **Bonitas Medical Fund** - bonitas.co.za
3. **GEMS** (Government Employees Medical Scheme) - gems.gov.za
4. **Medscheme** - medscheme.co.za
5. **FedHealth** - fedhealth.co.za

---

## 🎯 Current State vs Target State

### Current State ❌
- Static hardcoded documents
- Local Ollama (requires local installation)
- Simple keyword search
- No real citations with URLs
- Not publicly accessible

### Target State ✅
- Dynamic web scraping from official sources
- Cloud-based LLM (accessible anywhere)
- Semantic vector search
- Full citations with source links
- Public website deployment
- Real-time web search fallback
- Automated content updates

---

## 📋 Development Phases

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Build data collection system and vector database

#### 1.1 Environment Setup
- [x] Set up project environment variables (.env.local, .env.production)
- [x] Install additional dependencies (Playwright, pdf-parse, pgvector)
- [x] Configure database connection strings
- [x] Set up API keys for LLM services

#### 1.2 Document Collection System
- [x] Research website structures for Discovery and Bonitas
- [x] Build web scraper for Discovery Health
- [x] Build web scraper for Bonitas Medical Fund
- [ ] Research website structures for GEMS, Medscheme, FedHealth
- [ ] Build web scraper for GEMS
- [ ] Build web scraper for Medscheme
- [ ] Build web scraper for FedHealth
- [x] Create PDF parser for plan documents
- [x] Implement content cleaning and normalization

#### 1.3 Vector Database Setup
- [x] Design database schema with metadata tracking
- [x] Set up PostgreSQL with pgvector extension
- [x] Create document embedding pipeline
- [x] Build vector indexing system
- [x] Implement batch processing for initial load

**Success Criteria:**
- All 5 providers' content successfully scraped
- Documents stored in vector database
- Embeddings generated for all content

---

### Phase 2: RAG Pipeline Enhancement (Weeks 2-3)
**Goal:** Replace keyword search with semantic search and integrate cloud LLM

#### 2.1 Search Enhancement
- [x] Replace keyword search with semantic vector search
- [x] Implement citation tracking with source URLs
- [x] Add source ranking algorithm
- [ ] Integrate web search API for fallback

#### 2.2 LLM Integration
- [x] Select cloud LLM provider (OpenRouter recommended)
- [x] Replace Ollama with cloud LLM API
- [x] Implement improved RAG prompts
- [x] Add streaming response support

**Success Criteria:**
- Semantic search returning relevant results
- Citations include clickable links to source documents
- Responses generated via cloud LLM
- Streaming responses working smoothly

---

### Phase 3: Public Platform Development (Weeks 3-4)
**Goal:** Transform UI into public-facing platform

#### 3.1 UI Enhancements
- [ ] Create medical aid provider selector component
- [x] Enhance citation display with source links
- [ ] Update branding to "CoverCheck"
- [x] Add loading states and error handling
- [ ] Implement responsive design improvements

#### 3.2 Platform Features
- [ ] Add usage tracking and analytics
- [ ] Implement rate limiting for API endpoints
- [ ] Create user feedback system
- [ ] Add popular questions/suggestions

#### 3.3 Deployment
- [ ] Set up database hosting (Railway/Supabase)
- [ ] Configure Vercel deployment
- [ ] Set up production environment variables
- [ ] Test production build thoroughly

**Success Criteria:**
- Public URL accessible to anyone
- Professional UI with CoverCheck branding
- All 5 providers selectable
- Analytics tracking user queries

---

### Phase 4: Data Pipeline & Automation (Ongoing)
**Goal:** Keep content fresh and accurate

#### 4.1 Automated Updates
- [ ] Create scheduled scraping jobs (daily/weekly)
- [ ] Implement change detection system
- [ ] Add content freshness tracking
- [ ] Set up monitoring and alerting

#### 4.2 Quality & Compliance
- [ ] Perform security audit
- [ ] Write API documentation
- [ ] Create user guide and FAQ
- [ ] Add terms of service and privacy policy

**Success Criteria:**
- Content automatically updates weekly
- Alerts sent when scraping fails
- All compliance documents in place

---

## 💻 Technology Stack

### Current
- SvelteKit (Frontend + Backend)
- TypeScript
- Ollama (Local LLM)
- Hardcoded documents array

### New Additions
- **PostgreSQL + pgvector** - Vector database
- **Playwright** - Web scraping
- **pdf-parse** - PDF extraction
- **OpenRouter** - Cloud LLM access (recommended)
- **Vercel** - Hosting
- **Railway/Supabase** - Database hosting
- **Cron jobs** - Scheduled updates

---

## 💰 Estimated Costs

### Monthly Operating Costs
| Service | Cost | Notes |
|---------|------|-------|
| Database (Railway/Supabase) | R180-450 | PostgreSQL with pgvector |
| LLM API (OpenRouter) | R900-3600 | Depends on usage |
| Hosting (Vercel) | R0-360 | Free tier likely sufficient |
| **Total** | **R1080-4410/month** | ~$60-245 USD |

### Cost Optimization Tips
- Use caching to reduce LLM API calls
- Implement rate limiting
- Start with smaller/cheaper models
- Monitor usage closely

---

## 🔐 Security Considerations

- [ ] Sanitize all user inputs
- [ ] Implement rate limiting
- [ ] Add CAPTCHA for abuse prevention
- [x] Secure API keys in environment variables
- [ ] Regular security audits
- [ ] HTTPS only in production
- [ ] Content Security Policy headers

---

## 📈 Success Metrics

### Phase 1 Completion
- 5 providers' data successfully scraped
- Vector database operational
- 1000+ documents indexed

### Phase 2 Completion
- Semantic search accuracy >80%
- Response time <5 seconds
- All citations have working links

### Phase 3 Completion
- Public URL live and accessible
- 100+ test queries successful
- Mobile responsive

### Phase 4 Completion
- Automated updates running weekly
- 99% scraping success rate
- Compliance documents complete

---

## 🚀 Next Steps

### Immediate Actions (This Week)
1. Build web scrapers for remaining providers (GEMS, Medscheme, FedHealth)
2. Create medical aid provider selector component
3. Update branding to "CoverCheck"
4. Implement responsive design improvements

### This Month
1. Complete Phase 3 (Public Platform Development)
2. Set up database hosting (Railway/Supabase)
3. Configure Vercel deployment
4. Integrate web search API for fallback

### Next Month
1. Complete Phase 4 (Data Pipeline & Automation)
2. Security audit and compliance
3. Soft launch for testing

---

## 📝 Notes & Decisions

### Key Decisions Made
- Using PostgreSQL + pgvector (cost-effective, scalable)
- OpenRouter for LLM (flexible, multi-model access)
- Vercel for hosting (easy SvelteKit deployment)
- Weekly automated updates (balance freshness vs. cost)

### Open Questions
- [ ] How to handle provider-specific terminology differences?
- [ ] Should we allow anonymous queries or require registration?
- [ ] What rate limits are appropriate?
- [ ] How to handle plan comparisons across providers?

### Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Website structure changes | High | Monitor and alert on scraping failures |
| LLM API costs | Medium | Implement caching and rate limiting |
| Inaccurate information | Critical | Regular content audits, clear disclaimers |
| Legal/compliance issues | High | Terms of service, proper attribution |

---

## 📞 Support & Resources

### Documentation
- `README.md` - Project overview
- `docs/` - Technical documentation
- This file - Development roadmap

### External Resources
- [SvelteKit Docs](https://kit.svelte.dev/)
- [PostgreSQL + pgvector](https://github.com/pgvector/pgvector)
- [Playwright Docs](https://playwright.dev/)
- [OpenRouter API](https://openrouter.ai/)

---

**Last Updated:** 2025-11-19
**Version:** 1.1
**Status:** Phase 3 In Progress

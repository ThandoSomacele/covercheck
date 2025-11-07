# Scraper Quality Improvement Plan

**Date Created:** 2025-11-07
**Status:** In Progress
**Priority:** Critical - Quality data is essential for accurate medical aid information

## Problem Statement

Initial scraping resulted in only **5 out of 30 documents** (17%) being high quality. The remaining documents were:
- 6 Discovery Health pages returning 404 errors
- 10 Bonitas pages returning empty content (95 chars)
- 8 Momentum pages returning error pages

**Critical Issue:** Without quality data, we risk providing false or factually incorrect medical aid information to users.

## Success Criteria

✅ Minimum **20 high-quality documents** with:
- Medical terminology present (5+ terms)
- Content length > 1000 characters
- Low noise ratio (< 5% cookie/navigation text)

✅ Less than 5 404/error pages total
✅ Each provider has at least 5 working plan/benefit pages
✅ Average content length > 3000 chars for valid pages

## Phase 1: Research & URL Discovery (30-45 mins)

### Discovery Health
**Goal:** Find working URLs for all major plans and benefits

- [ ] Research current site structure (they recently redesigned)
- [ ] Find **6 main plan pages**:
  - Executive Plan
  - Comprehensive Series
  - Priority Series
  - Saver Series
  - Smart Series
  - Core Series
- [ ] Find **3 benefits pages**:
  - Day-to-day benefits
  - Hospital benefits
  - Chronic illness benefits
- [ ] Find **3 support pages**:
  - Claims process
  - FAQs
  - Contact information

**Target:** 12 working URLs

### Bonitas Medical Fund
**Goal:** Fix empty content issues, find valid plan URLs

- [ ] Research site structure and navigation patterns
- [ ] Find **4 main plan pages**:
  - BonSelect
  - BonStandard
  - BonPrimary
  - BonComprehensive
- [ ] Find **3 benefits pages**:
  - Hospital benefits
  - Chronic benefits
  - Day-to-day benefits
- [ ] Find **3 support pages**:
  - Claims
  - Help center/FAQ
  - Contact

**Target:** 10 working URLs

### Momentum Health
**Goal:** Solve error page issues, find actual content URLs

- [ ] Research site structure (may require JavaScript rendering)
- [ ] Find **5 main plan pages**:
  - Custom
  - Incentive
  - Summit
  - Extender
  - Ingwe
- [ ] Find **3 benefits pages**:
  - Hospital cover
  - Day-to-day benefits
  - Chronic benefits
- [ ] Find **HealthReturns page** (their rewards program)
- [ ] Find **3 support pages**:
  - Claims
  - Help/FAQ
  - Contact

**Target:** 12 working URLs

## Phase 2: Scraper Improvements (30 mins)

### Code Updates

- [ ] **Update Discovery scraper** (`DiscoveryHealthScraper.ts`)
  - Replace broken URLs with verified working ones
  - Add plan-specific URLs for all 6 plans

- [ ] **Update Bonitas scraper** (`BonitasScraper.ts`)
  - Fix empty content issues
  - Update all plan URLs
  - Adjust selectors if needed

- [ ] **Update Momentum scraper** (`MomentumHealthScraper.ts`)
  - Replace error-prone URLs
  - Add JavaScript wait time if needed
  - Update content selectors

### Technical Improvements

- [ ] **Increase wait times** for JavaScript-heavy pages
  - Current: 2-3 seconds
  - Try: 5-7 seconds for dynamic content

- [ ] **Improve content extraction** (`BaseScraper.ts`)
  - Better handling of modern React/Vue layouts
  - Smarter main content detection
  - Filter out navigation/footer more effectively

- [ ] **Add empty page detection**
  - Reject pages with < 500 chars after cleaning
  - Log warning when content seems empty
  - Mark as error instead of "success"

## Phase 3: Testing & Validation (30 mins)

### Individual Testing

- [ ] Test **Discovery** scraper alone
  ```bash
  npm run scrape:discovery
  ```
  - Verify at least 8 good documents
  - Check for plan details and benefits info

- [ ] Test **Bonitas** scraper alone
  ```bash
  npm run scrape:bonitas
  ```
  - Verify actual content (not empty pages)
  - Check for plan pricing and benefits

- [ ] Test **Momentum** scraper alone
  ```bash
  npm run scrape:momentum
  ```
  - Verify no error pages
  - Check for HealthReturns info

### Full Validation

- [ ] Run **full scrape** of all providers
  ```bash
  npm run scrape
  ```

- [ ] Run **content validation**
  ```bash
  npx tsx scripts/validate-content.ts
  ```
  - Should show 20+ "GOOD" documents
  - Less than 5 error documents

- [ ] **Manual review** of samples
  - Read 2-3 documents from each provider
  - Verify medical information is accurate
  - Check for completeness

## Quality Metrics

Track these metrics before and after:

| Metric | Before | Target | After |
|--------|--------|--------|-------|
| Good documents | 5 (17%) | 20+ (67%) | ___ |
| Error/404 pages | 6 | <5 | ___ |
| Empty/noisy pages | 19 | <5 | ___ |
| Avg content length | 9,385 chars | >5,000 chars* | ___ |
| Medical terms avg | 3.2 | >5 | ___ |

*After excluding cookie banners and navigation

## Risk Mitigation

**If URLs are hard to find:**
- Use browser dev tools to inspect network requests
- Check site maps or robots.txt
- Look at their mobile site (often simpler URLs)

**If content is still empty:**
- May need full browser rendering (current setup should handle this)
- Check if content is loaded via API calls
- Consider using Playwright's `waitForSelector` for specific elements

**If timing out:**
- Increase timeout from 60s to 120s
- Add more granular wait conditions
- Split large pages into separate scrape targets

## Post-Completion

Once quality criteria are met:

- [ ] Document working URLs in scraper files
- [ ] Update `SCRAPING.md` with findings
- [ ] Archive old scraped data
- [ ] Generate fresh dataset
- [ ] Proceed to Phase 2: Database Setup

## Notes

- **Why this matters:** Incorrect medical information could lead to users making wrong decisions about their healthcare coverage
- **Learning opportunity:** Understanding web scraping challenges with modern SPAs (Single Page Applications)
- **Future improvement:** Consider using official APIs if providers offer them

---

**Estimated Total Time:** 1.5 - 2 hours
**Started:** 2025-11-07
**Completed:** _TBD_

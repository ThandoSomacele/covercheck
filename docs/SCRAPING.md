# Insurance Documentation Scraping System

## Overview

The scraping system collects medical aid and insurance documentation from South African provider websites. It's built to be extensible, resilient, and respectful of website resources.

## Architecture

### Components

```
src/lib/server/scrapers/
├── types.ts                    # TypeScript interfaces and types
├── BaseScraper.ts             # Abstract base class for all scrapers
├── DiscoveryHealthScraper.ts  # Discovery Health implementation
├── MomentumHealthScraper.ts   # Momentum Health implementation
├── ScraperOrchestrator.ts     # Manages multiple scrapers
└── index.ts                   # Public exports
```

### Key Concepts

**BaseScraper**
- Provides common functionality for all scrapers
- Handles browser management (Playwright)
- Implements rate limiting
- Extracts and cleans content
- Manages error handling

**Specific Scrapers**
- Extend `BaseScraper`
- Define target URLs and content types
- Configure selectors and rate limits
- Can override methods for provider-specific behavior

**ScraperOrchestrator**
- Manages multiple scrapers
- Runs scrapers sequentially or in parallel
- Aggregates results and statistics

## Usage

### Running Scrapers

```bash
# Scrape all providers
npm run scrape

# Scrape a specific provider
npm run scrape:discovery
npm run scrape:momentum

# Test the scraper (single page)
npx tsx scripts/test-scraper.ts
```

### Programmatic Usage

```typescript
import { ScraperOrchestrator } from './src/lib/server/scrapers';

const orchestrator = new ScraperOrchestrator();

// Scrape all providers
const results = await orchestrator.scrapeAll();

// Scrape specific provider
const discoveryResult = await orchestrator.scrapeProvider('Discovery Health');

// Get statistics
const stats = orchestrator.getStatistics(results);
console.log(`Total documents: ${stats.totalDocuments}`);

// Extract all documents
const allDocs = orchestrator.getAllDocuments(results);
```

### Scraped Data Structure

Each scraped document has the following structure:

```typescript
{
  id: string;              // Unique identifier
  title: string;           // Page title
  content: string;         // Cleaned text content
  url: string;             // Source URL
  contentType: string;     // plan_overview, benefits, claims_process, etc.
  provider: string;        // Insurance provider name
  scrapedAt: Date;         // Timestamp
  metadata?: object;       // Additional metadata
}
```

## Adding New Scrapers

### Step 1: Create a New Scraper Class

```typescript
// src/lib/server/scrapers/NewProviderScraper.ts
import { BaseScraper } from './BaseScraper.js';
import type { ScrapeResult, ScraperConfig } from './types.js';

export class NewProviderScraper extends BaseScraper {
  constructor() {
    const config: ScraperConfig = {
      baseUrl: 'https://www.provider.co.za',
      provider: 'New Provider',
      targets: [
        {
          url: 'https://www.provider.co.za/medical-aid',
          type: 'plan_overview'
        }
        // Add more target URLs
      ],
      selectors: {
        mainContent: 'main',
        title: 'h1',
        excludeSelectors: ['nav', 'footer']
      },
      rateLimit: {
        requestsPerMinute: 20,
        delayBetweenRequests: 3000
      }
    };

    super(config);
  }

  async scrape(): Promise<ScrapeResult> {
    return await this.scrapeTargets();
  }
}
```

### Step 2: Register in Orchestrator

```typescript
// src/lib/server/scrapers/ScraperOrchestrator.ts
private registerScrapers(): void {
  this.scrapers.set('Discovery Health', new DiscoveryHealthScraper());
  this.scrapers.set('Momentum Health', new MomentumHealthScraper());
  this.scrapers.set('New Provider', new NewProviderScraper()); // Add here
}
```

### Step 3: Export from Index

```typescript
// src/lib/server/scrapers/index.ts
export { NewProviderScraper } from './NewProviderScraper.js';
```

## Configuration

### Rate Limiting

Each scraper can configure rate limits:

```typescript
rateLimit: {
  requestsPerMinute: 20,        // Max requests per minute
  delayBetweenRequests: 3000    // Milliseconds between requests
}
```

### Content Selectors

Customize how content is extracted:

```typescript
selectors: {
  mainContent: 'main, article',  // Where to find content
  title: 'h1, .page-title',      // How to find page title
  excludeSelectors: [            // Elements to remove
    'nav',
    'footer',
    '.advertisement'
  ]
}
```

### Target Configuration

Define what pages to scrape:

```typescript
targets: [
  {
    url: 'https://example.com/page',
    type: 'plan_overview',           // Content type
    contentSelector?: 'article',     // Optional specific selector
    followLinks?: true               // Future: follow links on page
  }
]
```

## Error Handling

The scraper implements graceful error handling:

- Failed pages are logged but don't stop the entire scrape
- Timeout errors trigger retry with fallback navigation strategy
- All errors are collected in the result object
- Browser cleanup happens even on errors

## Best Practices

### Be Respectful
- Use reasonable rate limits (default: 3 seconds between requests)
- Don't scrape during peak hours if running large jobs
- Add delays between providers

### Content Quality
- Inspect pages first using `scripts/inspect-page.ts`
- Adjust selectors based on actual page structure
- Test with single pages before full scrapes

### Data Management
- Store scraped data with timestamps
- Keep raw data separate from processed data
- Version your scraped datasets

## Output

Scraped data is saved to `scraped-data/` directory with timestamped filenames:

```
scraped-data/
└── scrape-2025-11-06T12-30-45.json
```

Each file contains:
- Metadata (timestamp, statistics)
- Array of all scraped documents

## Troubleshomarks

### "Timeout errors"
- Increase timeout in `BaseScraper.ts`
- Check if website is accessible
- Try different `waitUntil` strategies

### "Empty content"
- Run `scripts/inspect-page.ts` to check page structure
- Adjust content selectors
- Check if page requires JavaScript rendering

### "Browser not found"
- Run `npx playwright install chromium`
- Check Playwright installation

## Future Enhancements

- [ ] Incremental updates (only scrape changed pages)
- [ ] Link following for comprehensive coverage
- [ ] PDF document extraction
- [ ] Structured data extraction (prices, benefits tables)
- [ ] Scheduling system for automated updates
- [ ] Change detection and alerts
- [ ] Multi-browser support for different rendering needs

## Learning Resources

As you work with the scraper, you'll learn about:

- **Web Scraping**: Using Playwright for browser automation
- **HTML Parsing**: Using Cheerio for content extraction
- **TypeScript Patterns**: Abstract classes, interfaces, and type safety
- **Rate Limiting**: Respectful web scraping practices
- **Error Handling**: Graceful degradation in distributed systems

## Next Steps

Once scraping is working well, the next phase involves:

1. **Document Processing**: Clean and structure the raw text
2. **Vector Database**: Store documents for semantic search
3. **RAG Integration**: Use scraped docs to answer user questions

See `COVERCHECK_ROADMAP.md` for the full development plan.

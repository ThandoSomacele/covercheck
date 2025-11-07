/**
 * Insurance documentation scraping system
 *
 * This module provides tools for scraping medical aid and insurance
 * information from South African provider websites.
 */

export { BaseScraper } from './BaseScraper.js';
export { DiscoveryHealthScraper } from './DiscoveryHealthScraper.js';
export { MomentumHealthScraper } from './MomentumHealthScraper.js';
export { ScraperOrchestrator } from './ScraperOrchestrator.js';

export type {
	ScrapedDocument,
	ScrapeResult,
	ScraperConfig,
	ScrapeTarget,
	DocumentType,
	InsuranceProvider,
	ContentSelectors
} from './types.js';

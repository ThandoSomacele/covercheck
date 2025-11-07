/**
 * Insurance documentation scraping system
 *
 * This module provides tools for scraping medical aid and insurance
 * information from the top 3 South African provider websites:
 * - Discovery Health (Largest medical scheme)
 * - Bonitas Medical Fund (Second-largest open scheme)
 * - Momentum Health (Major player)
 */

export { BaseScraper } from './BaseScraper.js';
export { DiscoveryHealthScraper } from './DiscoveryHealthScraper.js';
export { BonitasScraper } from './BonitasScraper.js';
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

/**
 * Core types for the insurance documentation scraping system
 */

export interface ScrapedDocument {
	/** Unique identifier for the document */
	id: string;
	/** Title of the document or page */
	title: string;
	/** Raw content extracted from the page */
	content: string;
	/** URL where the content was scraped from */
	url: string;
	/** Type of content (plan_details, benefits, exclusions, etc.) */
	contentType: DocumentType;
	/** Insurance provider name */
	provider: InsuranceProvider;
	/** When this content was scraped */
	scrapedAt: Date;
	/** Optional metadata */
	metadata?: Record<string, unknown>;
}

export type DocumentType =
	| 'plan_overview'
	| 'benefits'
	| 'exclusions'
	| 'pricing'
	| 'claims_process'
	| 'contact_info'
	| 'terms_conditions'
	| 'faq'
	| 'other';

export type InsuranceProvider =
	| 'Discovery Health'
	| 'Bonitas Medical Fund'
	| 'Momentum Health';

export interface ScrapeResult {
	success: boolean;
	documents: ScrapedDocument[];
	errors?: string[];
	provider: InsuranceProvider;
	timestamp: Date;
}

export interface ScraperConfig {
	/** Base URL for the provider's website */
	baseUrl: string;
	/** Provider name */
	provider: InsuranceProvider;
	/** URLs to scrape organized by content type */
	targets: ScrapeTarget[];
	/** Custom selectors for extracting content */
	selectors?: ContentSelectors;
	/** Rate limiting configuration */
	rateLimit?: {
		requestsPerMinute: number;
		delayBetweenRequests: number;
	};
}

export interface ScrapeTarget {
	/** URL to scrape */
	url: string;
	/** Type of content on this page */
	type: DocumentType;
	/** Optional CSS selector to narrow content extraction */
	contentSelector?: string;
	/** Whether to follow links on this page */
	followLinks?: boolean;
}

export interface ContentSelectors {
	/** Main content area selector */
	mainContent?: string;
	/** Title selector */
	title?: string;
	/** Sections to exclude */
	excludeSelectors?: string[];
}

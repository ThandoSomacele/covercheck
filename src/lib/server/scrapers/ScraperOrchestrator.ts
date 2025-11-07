import type { BaseScraper } from './BaseScraper.js';
import type { ScrapeResult, ScrapedDocument, InsuranceProvider } from './types.js';
import { DiscoveryHealthScraper } from './DiscoveryHealthScraper.js';
import { MomentumHealthScraper } from './MomentumHealthScraper.js';

/**
 * Orchestrates multiple scrapers and manages the scraping process
 *
 * This class:
 * - Runs scrapers in sequence or parallel
 * - Collects and aggregates results
 * - Handles errors gracefully
 * - Provides hooks for storing scraped data
 */
export class ScraperOrchestrator {
	private scrapers: Map<InsuranceProvider, BaseScraper>;

	constructor() {
		this.scrapers = new Map();
		this.registerScrapers();
	}

	/**
	 * Register all available scrapers
	 */
	private registerScrapers(): void {
		this.scrapers.set('Discovery Health', new DiscoveryHealthScraper());
		this.scrapers.set('Momentum Health', new MomentumHealthScraper());
		// Add more scrapers as they're implemented
		// this.scrapers.set('Bonitas', new BonitasScraper());
	}

	/**
	 * Get list of available providers
	 */
	getAvailableProviders(): InsuranceProvider[] {
		return Array.from(this.scrapers.keys());
	}

	/**
	 * Run a single scraper by provider name
	 */
	async scrapeProvider(provider: InsuranceProvider): Promise<ScrapeResult> {
		const scraper = this.scrapers.get(provider);
		if (!scraper) {
			throw new Error(`No scraper found for provider: ${provider}`);
		}

		console.log(`Starting scrape for ${provider}...`);
		const result = await scraper.scrape();

		console.log(
			`Completed scrape for ${provider}: ${result.documents.length} documents, ${result.errors?.length || 0} errors`
		);

		return result;
	}

	/**
	 * Run all registered scrapers sequentially
	 */
	async scrapeAll(): Promise<ScrapeResult[]> {
		const results: ScrapeResult[] = [];

		for (const [provider, scraper] of this.scrapers) {
			try {
				console.log(`\n=== Scraping ${provider} ===`);
				const result = await scraper.scrape();
				results.push(result);

				// Small delay between providers to be respectful
				await new Promise((resolve) => setTimeout(resolve, 5000));
			} catch (error) {
				console.error(`Failed to scrape ${provider}:`, error);
				results.push({
					success: false,
					documents: [],
					errors: [`Fatal error: ${error}`],
					provider,
					timestamp: new Date()
				});
			}
		}

		return results;
	}

	/**
	 * Run multiple scrapers in parallel (use with caution)
	 */
	async scrapeParallel(providers: InsuranceProvider[]): Promise<ScrapeResult[]> {
		const scrapePromises = providers.map((provider) => this.scrapeProvider(provider));
		return Promise.all(scrapePromises);
	}

	/**
	 * Get aggregate statistics from scrape results
	 */
	getStatistics(results: ScrapeResult[]): {
		totalDocuments: number;
		totalErrors: number;
		successfulProviders: number;
		documentsByProvider: Record<string, number>;
	} {
		let totalDocuments = 0;
		let totalErrors = 0;
		let successfulProviders = 0;
		const documentsByProvider: Record<string, number> = {};

		for (const result of results) {
			totalDocuments += result.documents.length;
			totalErrors += result.errors?.length || 0;
			if (result.success) successfulProviders++;
			documentsByProvider[result.provider] = result.documents.length;
		}

		return {
			totalDocuments,
			totalErrors,
			successfulProviders,
			documentsByProvider
		};
	}

	/**
	 * Extract all documents from scrape results
	 */
	getAllDocuments(results: ScrapeResult[]): ScrapedDocument[] {
		return results.flatMap((result) => result.documents);
	}
}

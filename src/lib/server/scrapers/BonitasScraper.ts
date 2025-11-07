import { BaseScraper } from './BaseScraper.js';
import type { ScrapeResult, ScraperConfig } from './types.js';

/**
 * Scraper for Bonitas Medical Fund
 *
 * Bonitas is the second-largest open medical scheme in South Africa,
 * with over 700,000 members. This scraper focuses on their plan
 * information, benefits, and coverage details.
 */
export class BonitasScraper extends BaseScraper {
	constructor() {
		const config: ScraperConfig = {
			baseUrl: 'https://www.bonitas.co.za',
			provider: 'Bonitas Medical Fund',
			targets: [
				// Main plans page with dynamic selector - VERIFIED
				{
					url: 'https://www.bonitas.co.za/plans/',
					type: 'plan_overview',
					contentSelector: undefined // Let it auto-detect
				},
				// Rules and amendments
				{
					url: 'https://www.bonitas.co.za/rules-and-amendments',
					type: 'other'
				}
				// Note: Bonitas uses dynamic content loading on their plans page
				// The /plans/ page contains information for all their plans:
				// - BonCap (Income-based)
				// - BonFit / BonFit Select
				// - BonSave / BonSave Select
				// - BonEssential / BonEssential Select
				// - Primary / Primary Select
				// - Standard / Standard Select
			],
			selectors: {
				mainContent: 'main, .main-content, article, .entry-content, .content',
				title: 'h1, .entry-title, .page-title',
				excludeSelectors: [
					'script',
					'style',
					'noscript',
					'iframe',
					'nav',
					'header',
					'footer',
					'.cookie-notice',
					'.advertisement',
					'#menu',
					'.breadcrumb',
					'.social-share'
				]
			},
			rateLimit: {
				requestsPerMinute: 20,
				delayBetweenRequests: 3000 // 3 seconds between requests
			}
		};

		super(config);
	}

	/**
	 * Execute the scraping process for Bonitas Medical Fund
	 */
	async scrape(): Promise<ScrapeResult> {
		console.log('Starting Bonitas Medical Fund scrape...');
		return await this.scrapeTargets();
	}
}

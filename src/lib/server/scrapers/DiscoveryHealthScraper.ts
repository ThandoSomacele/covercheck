import { BaseScraper } from './BaseScraper.js';
import type { ScrapeResult, ScraperConfig } from './types.js';

/**
 * Scraper for Discovery Health medical aid plans
 *
 * Discovery Health is one of South Africa's largest medical schemes.
 * This scraper targets their plan information, benefits, and coverage details.
 */
export class DiscoveryHealthScraper extends BaseScraper {
	constructor() {
		const config: ScraperConfig = {
			baseUrl: 'https://www.discovery.co.za',
			provider: 'Discovery Health',
			targets: [
				// Main medical scheme overview
				{
					url: 'https://www.discovery.co.za/medical-aid',
					type: 'plan_overview'
				},
				// Individual Plan Pages (7 main plans) - VERIFIED URLS
				{
					url: 'https://www.discovery.co.za/medical-aid/executive-plan',
					type: 'plan_overview'
				},
				{
					url: 'https://www.discovery.co.za/medical-aid/comprehensive-series',
					type: 'plan_overview'
				},
				{
					url: 'https://www.discovery.co.za/medical-aid/priority-series',
					type: 'plan_overview'
				},
				{
					url: 'https://www.discovery.co.za/medical-aid/saver-series',
					type: 'plan_overview'
				},
				{
					url: 'https://www.discovery.co.za/medical-aid/smart-series',
					type: 'plan_overview'
				},
				{
					url: 'https://www.discovery.co.za/medical-aid/core-series',
					type: 'plan_overview'
				},
				{
					url: 'https://www.discovery.co.za/medical-aid/keycare-series',
					type: 'plan_overview'
				},
				// Benefits and coverage - VERIFIED
				{
					url: 'https://www.discovery.co.za/medical-aid/benefits-and-cover',
					type: 'benefits'
				},
				{
					url: 'https://www.discovery.co.za/medical-aid/chronic-illness-benefit',
					type: 'benefits'
				},
				{
					url: 'https://www.discovery.co.za/medical-aid/product-benefit-enhancements',
					type: 'benefits'
				},
				// Claims and support
				{
					url: 'https://www.discovery.co.za/medical-aid/how-to-claim',
					type: 'claims_process'
				},
				{
					url: 'https://www.discovery.co.za/medical-aid/ask-discovery-health-for-help',
					type: 'faq'
				},
				// Additional info
				{
					url: 'https://www.discovery.co.za/medical-aid/compare-medical-aid-plans',
					type: 'other'
				}
			],
			selectors: {
				mainContent: 'main, .main-content, article, .content',
				title: 'h1, .page-title, .hero-title',
				excludeSelectors: [
					'script',
					'style',
					'nav',
					'header',
					'footer',
					'.cookie-banner',
					'.advertisement',
					'#navigation',
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
	 * Execute the scraping process for Discovery Health
	 */
	async scrape(): Promise<ScrapeResult> {
		console.log('Starting Discovery Health scrape...');
		return await this.scrapeTargets();
	}

	/**
	 * Additional Discovery-specific processing could go here
	 * For example: extracting Vitality points information, plan comparisons, etc.
	 */
}

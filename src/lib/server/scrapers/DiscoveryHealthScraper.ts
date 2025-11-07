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
				// Individual plan pages - these are the main plan options
				{
					url: 'https://www.discovery.co.za/medical-aid/medical-aid-plans/executive-plan',
					type: 'plan_overview'
				},
				{
					url: 'https://www.discovery.co.za/medical-aid/medical-aid-plans/comprehensive-series',
					type: 'plan_overview'
				},
				{
					url: 'https://www.discovery.co.za/medical-aid/medical-aid-plans/priority-series',
					type: 'plan_overview'
				},
				{
					url: 'https://www.discovery.co.za/medical-aid/medical-aid-plans/saver-series',
					type: 'plan_overview'
				},
				{
					url: 'https://www.discovery.co.za/medical-aid/medical-aid-plans/smart-series',
					type: 'plan_overview'
				},
				{
					url: 'https://www.discovery.co.za/medical-aid/medical-aid-plans/core-series',
					type: 'plan_overview'
				},
				// Benefits information
				{
					url: 'https://www.discovery.co.za/medical-aid/benefits-and-limits',
					type: 'benefits'
				},
				// How claims work
				{
					url: 'https://www.discovery.co.za/medical-aid/how-to-claim',
					type: 'claims_process'
				},
				// Contact information
				{
					url: 'https://www.discovery.co.za/medical-aid/contact-us',
					type: 'contact_info'
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

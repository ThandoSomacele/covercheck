import { BaseScraper } from './BaseScraper.js';
import type { ScrapeResult, ScraperConfig } from './types.js';

/**
 * Scraper for Momentum Health medical aid plans
 *
 * Momentum Health (previously Momentum Medical Scheme) is another major
 * South African medical aid provider. This scraper focuses on their plan
 * information, benefits, and coverage details.
 */
export class MomentumHealthScraper extends BaseScraper {
	constructor() {
		const config: ScraperConfig = {
			baseUrl: 'https://www.momentum.co.za',
			provider: 'Momentum Health',
			targets: [
				// Main medical aid overview
				{
					url: 'https://www.momentum.co.za/for-you/medical-aid/medical-aid-cover',
					type: 'plan_overview'
				},
				// Individual plan options
				{
					url: 'https://www.momentum.co.za/for-you/medical-aid/medical-aid-plans/custom',
					type: 'plan_overview'
				},
				{
					url: 'https://www.momentum.co.za/for-you/medical-aid/medical-aid-plans/incentive',
					type: 'plan_overview'
				},
				{
					url: 'https://www.momentum.co.za/for-you/medical-aid/medical-aid-plans/summit',
					type: 'plan_overview'
				},
				{
					url: 'https://www.momentum.co.za/for-you/medical-aid/medical-aid-plans/extender',
					type: 'plan_overview'
				},
				{
					url: 'https://www.momentum.co.za/for-you/medical-aid/medical-aid-plans/ingwe',
					type: 'plan_overview'
				},
				// Benefits and coverage
				{
					url: 'https://www.momentum.co.za/for-you/medical-aid/medical-aid-benefits',
					type: 'benefits'
				},
				// Claims information
				{
					url: 'https://www.momentum.co.za/for-you/medical-aid/claims',
					type: 'claims_process'
				},
				// Contact details
				{
					url: 'https://www.momentum.co.za/for-you/medical-aid/contact-us',
					type: 'contact_info'
				},
				// FAQ
				{
					url: 'https://www.momentum.co.za/for-you/medical-aid/faq',
					type: 'faq'
				}
			],
			selectors: {
				mainContent: 'main, .main-content, article, .content, .page-content',
				title: 'h1, .page-title, .hero-heading',
				excludeSelectors: [
					'script',
					'style',
					'nav',
					'header',
					'footer',
					'.cookie-notice',
					'.advertisement',
					'#menu',
					'.social-links',
					'.breadcrumb'
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
	 * Execute the scraping process for Momentum Health
	 */
	async scrape(): Promise<ScrapeResult> {
		console.log('Starting Momentum Health scrape...');
		return await this.scrapeTargets();
	}

	/**
	 * Additional Momentum-specific processing could go here
	 * For example: extracting HealthReturns information, network providers, etc.
	 */
}

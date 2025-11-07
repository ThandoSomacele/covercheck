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
					url: 'https://www.momentum.co.za/momentum/personal/medical-aid',
					type: 'plan_overview'
				},
				// Individual Plan Pages (6 main options) - VERIFIED URLS
				{
					url: 'https://www.momentum.co.za/momentum/personal/medical-aid/custom-option',
					type: 'plan_overview'
				},
				{
					url: 'https://www.momentum.co.za/momentum/personal/medical-aid/incentive-option',
					type: 'plan_overview'
				},
				{
					url: 'https://www.momentum.co.za/momentum/personal/medical-aid/summit-option',
					type: 'plan_overview'
				},
				{
					url: 'https://www.momentum.co.za/momentum/personal/medical-aid/extender-option',
					type: 'plan_overview'
				},
				{
					url: 'https://www.momentum.co.za/momentum/personal/medical-aid/ingwe-option',
					type: 'plan_overview'
				},
				// Benefits information - VERIFIED
				{
					url: 'https://www.momentum.co.za/momentum/personal/products/medical-aid/day-to-day-benefit',
					type: 'benefits'
				},
				{
					url: 'https://www.momentum.co.za/momentum/personal/medical-aid/in-hospital-benefit',
					type: 'benefits'
				},
				{
					url: 'https://www.momentum.co.za/momentum/personal/medical-aid/chronic-benefit/chronic-conditions-covered',
					type: 'benefits'
				},
				// Plan comparison
				{
					url: 'https://www.momentum.co.za/momentum/personal/medical-aid/compare-medical-aid-plans',
					type: 'other'
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

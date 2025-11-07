import { chromium, type Browser, type Page } from 'playwright';
import * as cheerio from 'cheerio';
import type {
	ScrapedDocument,
	ScrapeResult,
	ScraperConfig,
	ScrapeTarget,
	DocumentType
} from './types.js';

/**
 * Base class for all insurance provider scrapers
 *
 * This provides common functionality for:
 * - Browser management
 * - Rate limiting
 * - Content extraction
 * - Error handling
 */
export abstract class BaseScraper {
	protected browser: Browser | null = null;
	protected config: ScraperConfig;
	private lastRequestTime = 0;

	constructor(config: ScraperConfig) {
		this.config = config;
	}

	/**
	 * Initialize the browser instance
	 */
	protected async initBrowser(): Promise<void> {
		if (!this.browser) {
			this.browser = await chromium.launch({
				headless: true,
				// Use less resources for scraping
				args: ['--disable-gpu', '--disable-dev-shm-usage', '--no-sandbox']
			});
		}
	}

	/**
	 * Close the browser and cleanup
	 */
	async close(): Promise<void> {
		if (this.browser) {
			await this.browser.close();
			this.browser = null;
		}
	}

	/**
	 * Respect rate limits between requests
	 */
	protected async respectRateLimit(): Promise<void> {
		if (!this.config.rateLimit) return;

		const now = Date.now();
		const timeSinceLastRequest = now - this.lastRequestTime;
		const minDelay = this.config.rateLimit.delayBetweenRequests;

		if (timeSinceLastRequest < minDelay) {
			await new Promise((resolve) => setTimeout(resolve, minDelay - timeSinceLastRequest));
		}

		this.lastRequestTime = Date.now();
	}

	/**
	 * Extract clean text content from HTML
	 */
	protected extractContent(html: string, selector?: string): string {
		const $ = cheerio.load(html);

		// Remove unwanted elements - be conservative here
		const excludeSelectors = this.config.selectors?.excludeSelectors || [
			'script',
			'style',
			'noscript',
			'iframe'
		];
		excludeSelectors.forEach((sel) => $(sel).remove());

		// Try to find the best content container
		let contentElement;
		if (selector) {
			contentElement = $(selector);
		} else {
			// Try different selectors in order of preference
			const possibleSelectors = [
				this.config.selectors?.mainContent,
				'main',
				'article',
				'[role="main"]',
				'.content',
				'.main-content',
				'#content',
				'body'
			].filter(Boolean) as string[];

			for (const sel of possibleSelectors) {
				const elem = $(sel);
				if (elem.length > 0) {
					const text = elem.text().trim();
					// Use this selector if it has substantial content
					if (text.length > 100) {
						contentElement = elem;
						break;
					}
				}
			}

			// Fallback to body
			if (!contentElement || contentElement.length === 0) {
				contentElement = $('body');
			}
		}

		const content = contentElement.text();

		// Clean up whitespace while preserving some structure
		return content.replace(/\s+/g, ' ').trim();
	}

	/**
	 * Extract title from page
	 */
	protected extractTitle(html: string): string {
		const $ = cheerio.load(html);
		const titleSelector = this.config.selectors?.title || 'h1, title';
		return $(titleSelector).first().text().trim() || 'Untitled';
	}

	/**
	 * Generate a unique ID for a document
	 */
	protected generateDocId(url: string, type: DocumentType): string {
		const urlHash = Buffer.from(url).toString('base64').substring(0, 10);
		const timestamp = Date.now().toString(36);
		return `${this.config.provider.toLowerCase().replace(/\s+/g, '-')}-${type}-${urlHash}-${timestamp}`;
	}

	/**
	 * Scrape a single page
	 */
	protected async scrapePage(page: Page, target: ScrapeTarget): Promise<ScrapedDocument> {
		await this.respectRateLimit();

		// Navigate to the page with more lenient wait conditions
		try {
			await page.goto(target.url, {
				waitUntil: 'domcontentloaded',
				timeout: 90000 // Increased from 60s to 90s
			});
			// Give the page time to render dynamic content (increased for JS-heavy sites)
			await page.waitForTimeout(5000); // Increased from 2s to 5s
		} catch (error) {
			// If navigation fails, try with commit event instead
			console.log('Retrying with commit event...');
			await page.goto(target.url, {
				waitUntil: 'commit',
				timeout: 90000
			});
			await page.waitForTimeout(7000); // Increased from 3s to 7s
		}

		// Get page content after removing unwanted elements
		await page.evaluate(() => {
			// Remove scripts, styles, and other noise
			const unwantedSelectors = [
				'script',
				'style',
				'noscript',
				'iframe',
				'nav',
				'header',
				'footer',
				'.cookie-banner',
				'[class*="cookie"]',
				'[id*="cookie"]'
			];
			unwantedSelectors.forEach((selector) => {
				document.querySelectorAll(selector).forEach((el) => el.remove());
			});
		});

		const html = await page.content();

		// Extract information
		const title = this.extractTitle(html);
		const content = this.extractContent(html, target.contentSelector);

		return {
			id: this.generateDocId(target.url, target.type),
			title,
			content,
			url: target.url,
			contentType: target.type,
			provider: this.config.provider,
			scrapedAt: new Date(),
			metadata: {
				pageUrl: page.url() // May differ from target.url if redirected
			}
		};
	}

	/**
	 * Main scrape method - to be implemented by specific scrapers
	 */
	abstract scrape(): Promise<ScrapeResult>;

	/**
	 * Generic scrape implementation that works for basic configurations
	 */
	protected async scrapeTargets(): Promise<ScrapeResult> {
		const documents: ScrapedDocument[] = [];
		const errors: string[] = [];

		try {
			await this.initBrowser();
			if (!this.browser) {
				throw new Error('Failed to initialize browser');
			}

			const page = await this.browser.newPage();

			// Scrape each target
			for (const target of this.config.targets) {
				try {
					console.log(`Scraping ${target.url}...`);
					const doc = await this.scrapePage(page, target);
					documents.push(doc);
				} catch (error) {
					const errorMsg = `Failed to scrape ${target.url}: ${error}`;
					console.error(errorMsg);
					errors.push(errorMsg);
				}
			}

			await page.close();
		} catch (error) {
			errors.push(`Scraper error: ${error}`);
		} finally {
			await this.close();
		}

		return {
			success: documents.length > 0,
			documents,
			errors: errors.length > 0 ? errors : undefined,
			provider: this.config.provider,
			timestamp: new Date()
		};
	}
}

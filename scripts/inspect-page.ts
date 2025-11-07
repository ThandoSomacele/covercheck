#!/usr/bin/env node
/**
 * Inspect a page to understand its structure
 */

import { chromium } from 'playwright';

async function inspect() {
	const browser = await chromium.launch({ headless: true });
	const page = await browser.newPage();

	try {
		await page.goto('https://www.discovery.co.za/medical-aid', {
			waitUntil: 'domcontentloaded',
			timeout: 60000
		});
		await page.waitForTimeout(3000);

		// Take a screenshot
		await page.screenshot({ path: 'page-screenshot.png', fullPage: true });
		console.log('Screenshot saved to page-screenshot.png');

		// Get HTML structure
		const html = await page.content();
		console.log('\nPage HTML length:', html.length);

		// Try different selectors
		const selectors = ['main', 'article', '.content', '.main-content', 'body'];

		for (const selector of selectors) {
			const element = await page.$(selector);
			if (element) {
				const text = await element.textContent();
				console.log(`\n${selector}: ${text?.substring(0, 200)}...`);
				console.log(`Length: ${text?.length} characters`);
			} else {
				console.log(`\n${selector}: Not found`);
			}
		}

		// Check for common content containers
		const contentChecks = await page.evaluate(() => {
			const checks: Record<string, boolean> = {};
			checks['main'] = !!document.querySelector('main');
			checks['article'] = !!document.querySelector('article');
			checks['.content'] = !!document.querySelector('.content');
			checks['[role="main"]'] = !!document.querySelector('[role="main"]');
			checks['#content'] = !!document.querySelector('#content');
			return checks;
		});

		console.log('\nElement availability:');
		Object.entries(contentChecks).forEach(([sel, exists]) => {
			console.log(`  ${sel}: ${exists ? '✓' : '✗'}`);
		});
	} catch (error) {
		console.error('Error:', error);
	} finally {
		await browser.close();
	}
}

inspect();

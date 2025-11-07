#!/usr/bin/env node
/**
 * Quick test script to verify scraper functionality
 * Tests a single page from Discovery Health
 */

import { DiscoveryHealthScraper } from '../src/lib/server/scrapers/index.js';

async function test() {
	console.log('🧪 Testing scraper functionality...\n');

	const scraper = new DiscoveryHealthScraper();

	try {
		// Override config to test just one page
		(scraper as any).config.targets = [
			{
				url: 'https://www.discovery.co.za/medical-aid',
				type: 'plan_overview'
			}
		];

		console.log('Scraping test page...');
		const result = await scraper.scrape();

		console.log('\n✅ Test Results:');
		console.log(`Success: ${result.success}`);
		console.log(`Documents scraped: ${result.documents.length}`);
		console.log(`Errors: ${result.errors?.length || 0}`);

		if (result.documents.length > 0) {
			const doc = result.documents[0];
			console.log('\n📄 Sample Document:');
			console.log(`  ID: ${doc.id}`);
			console.log(`  Title: ${doc.title}`);
			console.log(`  Provider: ${doc.provider}`);
			console.log(`  Type: ${doc.contentType}`);
			console.log(`  URL: ${doc.url}`);
			console.log(`  Content length: ${doc.content.length} characters`);
			console.log(`  Content preview: ${doc.content.substring(0, 150)}...`);
		}

		if (result.errors && result.errors.length > 0) {
			console.log('\n⚠️  Errors:');
			result.errors.forEach((err) => console.log(`  - ${err}`));
		}

		console.log('\n✅ Test completed successfully!');
	} catch (error) {
		console.error('\n❌ Test failed:', error);
		process.exit(1);
	}
}

test();

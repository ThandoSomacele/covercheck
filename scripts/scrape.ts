#!/usr/bin/env node
/**
 * CLI script to test and run the insurance scrapers
 *
 * Usage:
 *   npm run scrape              # Scrape all providers
 *   npm run scrape discovery    # Scrape Discovery Health only
 *   npm run scrape bonitas      # Scrape Bonitas Medical Fund only
 *   npm run scrape momentum     # Scrape Momentum Health only
 */

import { ScraperOrchestrator } from '../src/lib/server/scrapers/index.js';
import type { InsuranceProvider } from '../src/lib/server/scrapers/index.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
	const args = process.argv.slice(2);
	const provider = args[0]?.toLowerCase();

	const orchestrator = new ScraperOrchestrator();

	console.log('🏥 CoverCheck - Insurance Documentation Scraper\n');

	try {
		let results;

		if (provider === 'discovery') {
			console.log('Scraping Discovery Health only...\n');
			results = [await orchestrator.scrapeProvider('Discovery Health')];
		} else if (provider === 'bonitas') {
			console.log('Scraping Bonitas Medical Fund only...\n');
			results = [await orchestrator.scrapeProvider('Bonitas Medical Fund')];
		} else if (provider === 'momentum') {
			console.log('Scraping Momentum Health only...\n');
			results = [await orchestrator.scrapeProvider('Momentum Health')];
		} else {
			if (provider) {
				console.log(`Unknown provider: ${provider}`);
				console.log('Available providers:', orchestrator.getAvailableProviders().join(', '));
				console.log('\nScraping all providers instead...\n');
			}
			results = await orchestrator.scrapeAll();
		}

		// Display statistics
		const stats = orchestrator.getStatistics(results);
		console.log('\n' + '='.repeat(60));
		console.log('📊 Scraping Summary');
		console.log('='.repeat(60));
		console.log(`Total documents scraped: ${stats.totalDocuments}`);
		console.log(`Successful providers: ${stats.successfulProviders}/${results.length}`);
		console.log(`Total errors: ${stats.totalErrors}`);
		console.log('\nDocuments by provider:');
		Object.entries(stats.documentsByProvider).forEach(([prov, count]) => {
			console.log(`  - ${prov}: ${count} documents`);
		});

		// Save results to file
		const outputDir = join(process.cwd(), 'scraped-data');
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const filename = `scrape-${timestamp}.json`;
		const filepath = join(outputDir, filename);

		// Create directory if it doesn't exist
		try {
			const { mkdirSync } = await import('fs');
			mkdirSync(outputDir, { recursive: true });
		} catch (e) {
			// Directory might already exist
		}

		const documents = orchestrator.getAllDocuments(results);
		writeFileSync(
			filepath,
			JSON.stringify(
				{
					metadata: {
						scrapedAt: new Date().toISOString(),
						statistics: stats
					},
					documents
				},
				null,
				2
			)
		);

		console.log(`\n💾 Results saved to: ${filepath}`);

		// Show sample of first document
		if (documents.length > 0) {
			console.log('\n📄 Sample document:');
			const sample = documents[0];
			console.log(`  Title: ${sample.title}`);
			console.log(`  Provider: ${sample.provider}`);
			console.log(`  Type: ${sample.contentType}`);
			console.log(`  URL: ${sample.url}`);
			console.log(`  Content preview: ${sample.content.substring(0, 200)}...`);
		}

		console.log('\n✅ Scraping completed successfully!');
	} catch (error) {
		console.error('\n❌ Scraping failed:', error);
		process.exit(1);
	}
}

main();

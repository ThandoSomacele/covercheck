#!/usr/bin/env node
/**
 * Analyze scraped data quality and statistics
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

function analyzeLatestScrape() {
	const scrapedDir = join(process.cwd(), 'scraped-data');
	const files = readdirSync(scrapedDir).filter((f) => f.endsWith('.json'));

	if (files.length === 0) {
		console.log('No scraped data files found.');
		return;
	}

	// Get the most recent file
	const latestFile = files.sort().reverse()[0];
	const filepath = join(scrapedDir, latestFile);

	console.log(`📊 Analyzing: ${latestFile}\n`);

	const data = JSON.parse(readFileSync(filepath, 'utf-8'));
	const { documents } = data;

	// Overall stats
	console.log('=== Overall Statistics ===');
	console.log(`Total documents: ${documents.length}`);
	console.log(
		`Scraped at: ${new Date(data.metadata.scrapedAt).toLocaleString()}\n`
	);

	// Content length analysis
	const contentLengths = documents.map((d: any) => d.content.length);
	const avgLength = Math.round(
		contentLengths.reduce((a: number, b: number) => a + b, 0) / contentLengths.length
	);
	const minLength = Math.min(...contentLengths);
	const maxLength = Math.max(...contentLengths);

	console.log('=== Content Analysis ===');
	console.log(`Average content length: ${avgLength} chars`);
	console.log(`Min content length: ${minLength} chars`);
	console.log(`Max content length: ${maxLength} chars\n`);

	// Provider breakdown
	const byProvider: Record<string, any[]> = {};
	documents.forEach((doc: any) => {
		if (!byProvider[doc.provider]) byProvider[doc.provider] = [];
		byProvider[doc.provider].push(doc);
	});

	console.log('=== By Provider ===');
	Object.entries(byProvider).forEach(([provider, docs]) => {
		const avgLen = Math.round(
			docs.reduce((sum, d) => sum + d.content.length, 0) / docs.length
		);
		console.log(`${provider}: ${docs.length} docs (avg ${avgLen} chars)`);
	});

	// Content type breakdown
	const byType: Record<string, number> = {};
	documents.forEach((doc: any) => {
		byType[doc.contentType] = (byType[doc.contentType] || 0) + 1;
	});

	console.log('\n=== By Content Type ===');
	Object.entries(byType)
		.sort(([, a], [, b]) => b - a)
		.forEach(([type, count]) => {
			console.log(`${type}: ${count} documents`);
		});

	// Quality checks
	console.log('\n=== Quality Checks ===');
	const emptyDocs = documents.filter((d: any) => d.content.length < 100);
	const shortDocs = documents.filter(
		(d: any) => d.content.length >= 100 && d.content.length < 500
	);
	const errorPages = documents.filter((d: any) =>
		d.title.toLowerCase().includes("doesn't exist")
	);

	console.log(`Empty/minimal content (<100 chars): ${emptyDocs.length}`);
	console.log(`Short content (100-500 chars): ${shortDocs.length}`);
	console.log(`Error pages (404, etc.): ${errorPages.length}`);
	console.log(`Good quality (>500 chars): ${documents.length - emptyDocs.length - shortDocs.length}`);

	if (errorPages.length > 0) {
		console.log('\n⚠️  Pages that may need URL updates:');
		errorPages.forEach((doc: any) => {
			console.log(`  - ${doc.url}`);
			console.log(`    Title: ${doc.title}`);
		});
	}

	// Sample of good content
	const goodDocs = documents
		.filter((d: any) => d.content.length > 1000)
		.sort((a: any, b: any) => b.content.length - a.content.length);

	if (goodDocs.length > 0) {
		console.log('\n=== Sample of Quality Content ===');
		const sample = goodDocs[0];
		console.log(`Title: ${sample.title}`);
		console.log(`Provider: ${sample.provider}`);
		console.log(`Type: ${sample.contentType}`);
		console.log(`Length: ${sample.content.length} chars`);
		console.log(`Preview: ${sample.content.substring(0, 300)}...`);
	}
}

analyzeLatestScrape();

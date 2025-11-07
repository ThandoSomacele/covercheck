#!/usr/bin/env node
/**
 * Deep content validation - checks if scraped data is actually useful
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

function validateContent() {
	const scrapedDir = join(process.cwd(), 'scraped-data');
	const files = readdirSync(scrapedDir).filter((f) => f.endsWith('.json'));
	const latestFile = files.sort().reverse()[0];
	const filepath = join(scrapedDir, latestFile);

	const data = JSON.parse(readFileSync(filepath, 'utf-8'));
	const { documents } = data;

	console.log('🔍 Deep Content Validation\n');
	console.log('='.repeat(60));

	// Check for actual medical aid information
	const medicalTerms = [
		'hospital',
		'medical',
		'benefit',
		'cover',
		'chronic',
		'claim',
		'doctor',
		'specialist',
		'treatment',
		'plan',
		'contribution',
		'premium',
		'prescribed minimum benefits',
		'PMB',
		'day-to-day',
		'co-payment'
	];

	const cookieNoiseTerms = [
		'cookie policy',
		'privacy preference',
		'strictly necessary cookies',
		'performance cookies',
		'log in',
		'register'
	];

	let goodDocs = 0;
	let noisyDocs = 0;
	let errorDocs = 0;

	console.log('\n📋 Document Quality Assessment:\n');

	documents.forEach((doc: any, idx: number) => {
		const content = doc.content.toLowerCase();
		const isError = doc.title.toLowerCase().includes("doesn't exist");

		// Count medical terms
		const medicalScore = medicalTerms.filter((term) => content.includes(term)).length;

		// Count cookie/noise terms
		const noiseScore = cookieNoiseTerms.filter((term) => content.includes(term)).length;

		// Calculate noise ratio
		const cookieText = content.match(/cookie/gi)?.length || 0;
		const totalWords = content.split(' ').length;
		const noiseRatio = (noiseScore + cookieText) / totalWords;

		let quality = '❌ BAD';
		if (isError) {
			quality = '🚫 404';
			errorDocs++;
		} else if (medicalScore >= 5 && noiseRatio < 0.05) {
			quality = '✅ GOOD';
			goodDocs++;
		} else if (medicalScore >= 3 && noiseRatio < 0.1) {
			quality = '⚠️  OK';
			goodDocs++;
		} else {
			quality = '❌ NOISY';
			noisyDocs++;
		}

		console.log(
			`${idx + 1}. [${quality}] ${doc.provider} - ${doc.title.substring(0, 40)}...`
		);
		console.log(
			`   Medical terms: ${medicalScore}/${medicalTerms.length} | Noise: ${(noiseRatio * 100).toFixed(1)}% | Length: ${doc.content.length} chars`
		);

		// Show content sample for first few
		if (idx < 3) {
			const sample = content
				.replace(/cookie policy.*?confirm my choices/gi, '[COOKIE BANNER REMOVED]')
				.substring(0, 200)
				.trim();
			console.log(`   Preview: ${sample}...\n`);
		}
	});

	console.log('\n' + '='.repeat(60));
	console.log('📊 Summary:');
	console.log(`✅ Good/Usable: ${goodDocs}/${documents.length} (${Math.round((goodDocs / documents.length) * 100)}%)`);
	console.log(`❌ Too noisy: ${noisyDocs}/${documents.length}`);
	console.log(`🚫 404 errors: ${errorDocs}/${documents.length}`);

	// List the actually good documents
	console.log('\n✨ High Quality Documents:\n');
	const highQuality = documents.filter((doc: any) => {
		const content = doc.content.toLowerCase();
		const medicalScore = medicalTerms.filter((term) => content.includes(term)).length;
		return (
			medicalScore >= 5 &&
			!doc.title.toLowerCase().includes("doesn't exist") &&
			doc.content.length > 1000
		);
	});

	highQuality.forEach((doc: any) => {
		console.log(`  • ${doc.provider}: ${doc.title}`);
		console.log(`    ${doc.url}`);
		console.log(`    ${doc.content.length} chars, type: ${doc.contentType}\n`);
	});

	// Verdict
	console.log('='.repeat(60));
	if (goodDocs >= 15 && errorDocs < 10) {
		console.log('✅ VERDICT: Good enough to proceed with database setup');
	} else if (goodDocs >= 10) {
		console.log('⚠️  VERDICT: Marginal - consider improving URLs first');
	} else {
		console.log('❌ VERDICT: Not enough quality data - fix scrapers first');
	}
}

validateContent();

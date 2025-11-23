/**
 * Test CoverCheck UI with Playwright
 * This script tests the actual user experience with multiple queries
 */

import { chromium, type Browser, type Page } from 'playwright';

interface UITestResult {
	testNumber: number;
	query: string;
	success: boolean;
	error?: string;
	responseTime: number;
	responseReceived: boolean;
	responseText?: string;
	sourcesCount?: number;
}

async function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function testUIConsistency() {
	console.log('🧪 Testing CoverCheck UI Consistency with Playwright\n');

	let browser: Browser | null = null;
	let page: Page | null = null;

	try {
		// Launch browser
		console.log('🌐 Launching browser...\n');
		browser = await chromium.launch({ headless: false });
		page = await browser.newPage();

		// Navigate to the app (assuming dev server is running)
		const appUrl = 'http://localhost:5173'; // SvelteKit default dev port
		console.log(`📍 Navigating to ${appUrl}...\n`);

		try {
			await page.goto(appUrl, { timeout: 10000 });
		} catch (error) {
			console.error('❌ Failed to load app. Is the dev server running?');
			console.error('   Run: npm run dev');
			process.exit(1);
		}

		await delay(2000); // Wait for app to load

		// Test queries
		const testQueries = [
			'What maternity benefits are covered?',
			'What are the hospital coverage options?',
			'Does my plan cover chronic medication?',
			'What emergency services are included?',
			'Can I claim for specialist visits?',
		];

		const results: UITestResult[] = [];

		for (let i = 0; i < testQueries.length; i++) {
			const query = testQueries[i];
			const testNum = i + 1;

			console.log(`Test ${testNum}/${testQueries.length}: "${query}"`);

			const startTime = Date.now();

			try {
				// Find the input field
				const input = page.locator('input[type="text"], textarea').first();
				await input.waitFor({ timeout: 5000 });

				// Clear and type query
				await input.clear();
				await input.fill(query);

				// Submit (either by pressing Enter or clicking submit button)
				await input.press('Enter');

				// Wait for response with timeout
				const responseReceived = await page.waitForSelector('.message, [data-role="assistant"], .response', {
					timeout: 30000,
					state: 'attached'
				}).then(() => true).catch(() => false);

				const responseTime = Date.now() - startTime;

				if (responseReceived) {
					// Get the response text
					await delay(1000); // Wait for streaming to complete
					const responseElements = page.locator('.message, [data-role="assistant"], .response').last();
					const responseText = await responseElements.textContent();

					// Count sources
					const sourceElements = page.locator('[data-source], .source, a[href*="http"]');
					const sourcesCount = await sourceElements.count();

					results.push({
						testNumber: testNum,
						query,
						success: true,
						responseTime,
						responseReceived: true,
						responseText: responseText || 'No text captured',
						sourcesCount
					});

					console.log(`✅ Success - ${responseTime}ms`);
					console.log(`   Response preview: ${responseText?.substring(0, 100)}...`);
					console.log(`   Sources: ${sourcesCount}\n`);

				} else {
					results.push({
						testNumber: testNum,
						query,
						success: false,
						error: 'Response timeout',
						responseTime,
						responseReceived: false
					});

					console.log(`❌ Failed - No response within 30 seconds\n`);
				}

			} catch (error) {
				const responseTime = Date.now() - startTime;
				const errorMessage = error instanceof Error ? error.message : String(error);

				results.push({
					testNumber: testNum,
					query,
					success: false,
					error: errorMessage,
					responseTime,
					responseReceived: false
				});

				console.log(`❌ Failed - ${responseTime}ms - ${errorMessage}\n`);
			}

			// Wait between queries
			if (i < testQueries.length - 1) {
				console.log('Waiting 3 seconds before next query...\n');
				await delay(3000);
			}
		}

		// Analysis
		console.log('\n' + '='.repeat(60));
		console.log('📊 UI TEST RESULTS');
		console.log('='.repeat(60) + '\n');

		const successCount = results.filter(r => r.success).length;
		const failureCount = results.filter(r => !r.success).length;
		const successRate = (successCount / results.length) * 100;

		console.log(`Total Queries: ${results.length}`);
		console.log(`✅ Successful: ${successCount} (${successRate.toFixed(1)}%)`);
		console.log(`❌ Failed: ${failureCount} (${(100 - successRate).toFixed(1)}%)`);

		if (successCount > 0) {
			const successResults = results.filter(r => r.success);
			const avgResponseTime = successResults.reduce((sum, r) => sum + r.responseTime, 0) / successCount;
			const minResponseTime = Math.min(...successResults.map(r => r.responseTime));
			const maxResponseTime = Math.max(...successResults.map(r => r.responseTime));

			console.log(`\n⏱️  Response Times:`);
			console.log(`  Average: ${(avgResponseTime / 1000).toFixed(1)}s`);
			console.log(`  Min: ${(minResponseTime / 1000).toFixed(1)}s`);
			console.log(`  Max: ${(maxResponseTime / 1000).toFixed(1)}s`);

			// Check if all responses have sources
			const responsesWithSources = successResults.filter(r => (r.sourcesCount || 0) > 0);
			console.log(`\n📚 Sources:`);
			console.log(`  Responses with sources: ${responsesWithSources.length}/${successCount}`);

			if (responsesWithSources.length < successCount) {
				console.log(`  ⚠️  Some responses missing sources!`);
			}
		}

		if (failureCount > 0) {
			console.log(`\n❌ Failures:`);
			results.filter(r => !r.success).forEach(r => {
				console.log(`  Test ${r.testNumber}: ${r.error || 'Unknown error'}`);
			});
		}

		console.log('\n' + '='.repeat(60));
		console.log('💡 UI EXPERIENCE ASSESSMENT');
		console.log('='.repeat(60) + '\n');

		if (successRate === 100) {
			console.log('✅ UI is working perfectly!');
			console.log('   All queries returned responses successfully');
		} else if (successRate >= 80) {
			console.log('⚠️  UI has occasional failures');
			console.log('   Most queries work but some fail');
			console.log('   Check network logs for errors');
		} else if (successRate >= 50) {
			console.log('🔴 UI has significant reliability issues');
			console.log('   Many queries are failing');
			console.log('   Backend or frontend errors likely');
		} else {
			console.log('🔴 CRITICAL: UI is mostly non-functional');
			console.log('   Most queries are failing');
			console.log('   Check server logs and API configuration');
		}

		console.log('\n');

	} catch (error) {
		console.error('💥 Test failed with error:');
		console.error(error);
		process.exit(1);
	} finally {
		// Cleanup
		if (browser) {
			await browser.close();
		}
	}
}

testUIConsistency().catch(error => {
	console.error('\n💥 Test runner failed:');
	console.error(error);
	process.exit(1);
});

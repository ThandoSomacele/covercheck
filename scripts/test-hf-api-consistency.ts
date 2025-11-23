/**
 * Test Hugging Face API consistency
 * This script makes multiple requests to test reliability and response times
 */

interface TestResult {
	testNumber: number;
	query: string;
	success: boolean;
	error?: string;
	responseTime: number;
	embeddingDimensions?: number;
	statusCode?: number;
}

async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
	const apiUrl = `https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5`;

	const response = await fetch(apiUrl, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			inputs: [text],
			options: { wait_for_model: true }
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`${response.status}: ${error.substring(0, 200)}`);
	}

	const result = await response.json();

	// Handle different response formats
	if (Array.isArray(result)) {
		return Array.isArray(result[0]) ? result[0] : result;
	}

	throw new Error('Unexpected response format from Hugging Face API');
}

async function testEmbeddingConsistency() {
	console.log('🧪 Testing Hugging Face API Consistency\n');

	const apiKey = process.env.HUGGINGFACE_API_KEY;
	if (!apiKey) {
		console.error('❌ HUGGINGFACE_API_KEY environment variable not set');
		process.exit(1);
	}

	console.log(`API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);
	console.log('Running 15 embedding requests with different queries...\n');

	const testQueries = [
		'What maternity benefits are covered?',
		'What are the hospital coverage options?',
		'Does my plan cover chronic medication?',
		'What emergency services are included?',
		'Can I claim for specialist visits?',
		'What are the pregnancy benefits?',
		'Is surgery covered on this plan?',
		'What dental benefits do I have?',
		'Are optical benefits included?',
		'What is covered for chronic conditions?',
		'How do I claim for hospital admission?',
		'What preventative care is covered?',
		'Are ambulance services included?',
		'What mental health benefits are available?',
		'Is physiotherapy covered?',
	];

	const results: TestResult[] = [];
	let consecutiveFailures = 0;

	for (let i = 0; i < testQueries.length; i++) {
		const testQuery = testQueries[i];
		const testNum = i + 1;
		const startTime = Date.now();

		try {
			console.log(`Test ${testNum}/${testQueries.length}: "${testQuery.substring(0, 40)}..."`);
			const embedding = await generateEmbedding(testQuery, apiKey);
			const responseTime = Date.now() - startTime;

			results.push({
				testNumber: testNum,
				query: testQuery,
				success: true,
				responseTime,
				embeddingDimensions: embedding.length,
				statusCode: 200
			});

			consecutiveFailures = 0;
			console.log(`✅ Success - ${responseTime}ms - ${embedding.length} dimensions\n`);

		} catch (error) {
			const responseTime = Date.now() - startTime;
			const errorMessage = error instanceof Error ? error.message : String(error);

			// Extract status code if present
			const statusMatch = errorMessage.match(/^(\d{3}):/);
			const statusCode = statusMatch ? parseInt(statusMatch[1]) : undefined;

			results.push({
				testNumber: testNum,
				query: testQuery,
				success: false,
				error: errorMessage,
				responseTime,
				statusCode
			});

			consecutiveFailures++;
			console.log(`❌ Failed - ${responseTime}ms - ${errorMessage}\n`);

			// If we get 3 consecutive failures, stop the test
			if (consecutiveFailures >= 3) {
				console.log('⚠️  Stopping test after 3 consecutive failures\n');
				break;
			}
		}

		// Wait 1 second between requests to avoid rate limiting
		if (i < testQueries.length - 1) {
			console.log('Waiting 1 second before next request...\n');
			await new Promise(resolve => setTimeout(resolve, 1000));
		}
	}

	// Analysis
	console.log('\n' + '='.repeat(60));
	console.log('📊 RESULTS SUMMARY');
	console.log('='.repeat(60) + '\n');

	const successCount = results.filter(r => r.success).length;
	const failureCount = results.filter(r => !r.success).length;
	const successRate = (successCount / results.length) * 100;

	console.log(`Total Requests: ${results.length}`);
	console.log(`✅ Successful: ${successCount} (${successRate.toFixed(1)}%)`);
	console.log(`❌ Failed: ${failureCount} (${(100 - successRate).toFixed(1)}%)`);

	if (successCount > 0) {
		const successResults = results.filter(r => r.success);
		const avgResponseTime = successResults.reduce((sum, r) => sum + r.responseTime, 0) / successCount;
		const minResponseTime = Math.min(...successResults.map(r => r.responseTime));
		const maxResponseTime = Math.max(...successResults.map(r => r.responseTime));

		console.log(`\n⏱️  Response Times:`);
		console.log(`  Average: ${avgResponseTime.toFixed(0)}ms`);
		console.log(`  Min: ${minResponseTime}ms`);
		console.log(`  Max: ${maxResponseTime}ms`);

		// Check dimension consistency
		const dimensions = successResults.map(r => r.embeddingDimensions!);
		const uniqueDimensions = [...new Set(dimensions)];

		console.log(`\n📏 Embedding Dimensions:`);
		if (uniqueDimensions.length === 1) {
			console.log(`  ✅ Consistent: ${uniqueDimensions[0]} dimensions`);
		} else {
			console.log(`  ⚠️  Inconsistent: ${uniqueDimensions.join(', ')} dimensions`);
		}
	}

	if (failureCount > 0) {
		console.log(`\n❌ Error Analysis:`);

		// Group by error type
		const errorsByStatus = new Map<number, number>();
		const errorsByMessage = new Map<string, number>();

		results.filter(r => !r.success).forEach(r => {
			if (r.statusCode) {
				errorsByStatus.set(r.statusCode, (errorsByStatus.get(r.statusCode) || 0) + 1);
			}

			// Categorize error messages
			const errorKey = r.error || 'Unknown error';
			const shortError = errorKey.length > 80 ? errorKey.substring(0, 80) + '...' : errorKey;
			errorsByMessage.set(shortError, (errorsByMessage.get(shortError) || 0) + 1);
		});

		if (errorsByStatus.size > 0) {
			console.log('\n  By Status Code:');
			errorsByStatus.forEach((count, status) => {
				const statusName =
					status === 429 ? '(Rate Limit)' :
					status === 502 ? '(Bad Gateway)' :
					status === 503 ? '(Service Unavailable)' :
					status === 500 ? '(Internal Server Error)' : '';
				console.log(`    ${status} ${statusName}: ${count} occurrences`);
			});
		}

		console.log('\n  Error Messages:');
		errorsByMessage.forEach((count, error) => {
			console.log(`    - ${error} (${count}x)`);
		});
	}

	console.log('\n' + '='.repeat(60));
	console.log('💡 ASSESSMENT & RECOMMENDATIONS');
	console.log('='.repeat(60) + '\n');

	if (successRate === 0) {
		console.log('🔴 CRITICAL: API is completely non-functional');
		console.log('   Immediate action required:');
		console.log('   1. Check API key validity');
		console.log('   2. Verify Hugging Face service status');
		console.log('   3. Consider switching to alternative provider (OpenAI, Cohere, Ollama)');
	} else if (successRate < 50) {
		console.log('🔴 CRITICAL: API reliability is below 50%');
		console.log('   This is unacceptable for production use.');
		console.log('   STRONGLY RECOMMEND switching to a paid/reliable provider:');
		console.log('   - OpenAI (text-embedding-3-small): $0.02 per 1M tokens');
		console.log('   - Cohere (embed-english-v3.0): Free tier available');
		console.log('   - Voyage AI (voyage-2): Good quality, reasonable pricing');
		console.log('   - Ollama (local): Free but requires server resources');
	} else if (successRate < 80) {
		console.log('⚠️  WARNING: API reliability is below 80%');
		console.log('   Consider these options:');
		console.log('   1. Implement more aggressive retry logic (already have 3 retries)');
		console.log('   2. Add fallback to local Ollama embeddings');
		console.log('   3. Monitor patterns - is it time-of-day dependent?');
		console.log('   4. Consider switching to paid provider for production');
	} else if (successRate < 95) {
		console.log('⚠️  CAUTION: API has occasional failures (${failureCount}/${results.length})');
		console.log('   Current retry logic should handle most cases');
		console.log('   Monitor for patterns and consider fallback strategy');
	} else if (successRate < 100) {
		console.log('✅ ACCEPTABLE: API is mostly reliable');
		console.log('   Minor failures are expected with free APIs');
		console.log('   Current retry logic should handle edge cases');
	} else {
		console.log('✅ EXCELLENT: API performed perfectly!');
		console.log('   All requests succeeded consistently');
	}

	// Check for specific error patterns
	const hasRateLimits = results.some(r => r.statusCode === 429);
	const hasServerErrors = results.some(r => r.statusCode && r.statusCode >= 500);

	if (hasRateLimits) {
		console.log('\n⏰ Rate Limiting Detected:');
		console.log('   - Free tier has request limits');
		console.log('   - Consider spacing requests further apart');
		console.log('   - Or upgrade to paid tier for higher limits');
	}

	if (hasServerErrors) {
		console.log('\n🔧 Server Errors Detected:');
		console.log('   - Hugging Face infrastructure may be unstable');
		console.log('   - This is outside your control');
		console.log('   - Recommend switching to more reliable provider');
	}

	console.log('\n');

	// Exit with error code if reliability is too low
	if (successRate < 80) {
		process.exit(1);
	}
}

testEmbeddingConsistency().catch(error => {
	console.error('\n💥 Test failed with error:');
	console.error(error);
	process.exit(1);
});

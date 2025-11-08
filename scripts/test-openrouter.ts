import OpenAI from 'openai';
import { config } from 'dotenv';

config();

async function testOpenRouter() {
	console.log('🧪 Testing OpenRouter API Connection\n');

	const apiKey = process.env.OPENROUTER_API_KEY;

	if (!apiKey) {
		console.error('❌ OPENROUTER_API_KEY not found in .env');
		process.exit(1);
	}

	console.log('✓ API Key loaded');
	console.log('  Format:', apiKey.substring(0, 12) + '...');
	console.log('  Length:', apiKey.length, 'characters\n');

	const openrouter = new OpenAI({
		baseURL: 'https://openrouter.ai/api/v1',
		apiKey: apiKey,
		defaultHeaders: {
			'HTTP-Referer': 'https://covercheck.co.za',
			'X-Title': 'CoverCheck - Test'
		}
	});

	console.log('🔄 Testing connection with a simple request...\n');

	try {
		const response = await openrouter.chat.completions.create({
			model: 'google/gemini-2.0-flash-exp:free',
			messages: [
				{
					role: 'user',
					content: 'Say "Hello, CoverCheck!" in one sentence.'
				}
			],
			max_tokens: 50
		});

		console.log('✅ Success! API is working correctly.\n');
		console.log('Response:', response.choices[0]?.message?.content);
		console.log('\n✓ Your OpenRouter API key is valid and working!');

	} catch (error: any) {
		console.error('❌ API Request Failed\n');
		console.error('Error Status:', error.status);
		console.error('Error Code:', error.code);
		console.error('Error Message:', error.error?.message || error.message);

		if (error.status === 401) {
			console.error('\n💡 This means your API key is invalid or not recognized by OpenRouter.');
			console.error('   Try these steps:');
			console.error('   1. Visit https://openrouter.ai/keys');
			console.error('   2. Delete the old key');
			console.error('   3. Create a new key');
			console.error('   4. Update .env with the new key');
			console.error('   5. Restart the dev server');
		} else if (error.status === 429) {
			console.error('\n💡 Rate limit reached. Try a different model or wait a moment.');
		}

		process.exit(1);
	}
}

testOpenRouter();

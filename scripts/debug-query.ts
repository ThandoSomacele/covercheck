/**
 * Debug a specific query to understand why it's not returning results
 */

import pg from 'pg';

const { Client } = pg;

// Hardcode connection string for testing
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING!;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY!;

async function generateEmbedding(text: string): Promise<number[]> {
	const apiUrl = `https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5`;

	const response = await fetch(apiUrl, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			inputs: [text],
			options: { wait_for_model: true }
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`${response.status}: ${error}`);
	}

	const result = await response.json();
	return Array.isArray(result[0]) ? result[0] : result;
}

function expandQuery(query: string): string {
	const expansions: { [key: string]: string[] } = {
		chronic: ['chronic condition', 'chronic disease list', 'CDL', 'long-term condition', 'ongoing treatment'],
		diabetes: ['chronic', 'CDL', 'chronic medication', 'blood sugar', 'glucose'],
		pmb: ['prescribed minimum benefits', 'PMB', 'minimum benefits', 'emergency', 'chronic disease list'],
	};

	let expandedQuery = query.toLowerCase();

	for (const [term, relatedTerms] of Object.entries(expansions)) {
		if (expandedQuery.includes(term)) {
			expandedQuery += ' ' + relatedTerms.join(' ');
		}
	}

	return expandedQuery;
}

async function debugQuery() {
	const query = "What chronic conditions are covered by Discovery Health?";

	console.log('🔍 Debugging Query:', query);
	console.log('='.repeat(60) + '\n');

	const db = new Client({ connectionString: DB_CONNECTION_STRING });

	try {
		await db.connect();
		console.log('✅ Connected to database\n');

		// Step 1: Check if we have Discovery Health documents
		console.log('📊 Step 1: Checking for Discovery Health documents...\n');

		const providerCheck = await db.query(`
			SELECT provider, COUNT(*) as doc_count
			FROM documents
			WHERE provider ILIKE '%discovery%'
			GROUP BY provider
		`);

		console.log('Discovery documents:', providerCheck.rows);

		const chunkCheck = await db.query(`
			SELECT provider, COUNT(*) as chunk_count
			FROM document_chunks
			WHERE provider ILIKE '%discovery%'
			GROUP BY provider
		`);

		console.log('Discovery chunks:', chunkCheck.rows);

		// Step 2: Search for chronic-related content
		console.log('\n📊 Step 2: Searching for chronic-related content...\n');

		const chronicContent = await db.query(`
			SELECT document_title, provider, LEFT(content, 100) as preview
			FROM document_chunks
			WHERE content ILIKE '%chronic%'
			AND provider ILIKE '%discovery%'
			LIMIT 5
		`);

		console.log('Sample chronic content from Discovery:', chronicContent.rows);

		// Step 3: Expand query
		console.log('\n📊 Step 3: Query expansion...\n');
		const expandedQuery = expandQuery(query);
		console.log('Original query:', query);
		console.log('Expanded query:', expandedQuery);

		// Step 4: Generate embedding
		console.log('\n📊 Step 4: Generating embedding...\n');
		const queryEmbedding = await generateEmbedding(expandedQuery);
		console.log('Embedding dimensions:', queryEmbedding.length);
		console.log('First 5 values:', queryEmbedding.slice(0, 5));

		// Step 5: Semantic search WITHOUT provider filter
		console.log('\n📊 Step 5: Semantic search (NO provider filter)...\n');

		const searchAll = await db.query(`
			SELECT
				document_title,
				provider,
				LEFT(content, 150) as preview,
				1 - (embedding <=> $1::vector) AS similarity
			FROM document_chunks
			WHERE embedding IS NOT NULL
			ORDER BY embedding <=> $1::vector
			LIMIT 5
		`, [JSON.stringify(queryEmbedding)]);

		console.log('Top 5 results (all providers):');
		searchAll.rows.forEach((row, i) => {
			console.log(`\n${i + 1}. ${row.document_title} (${row.provider})`);
			console.log(`   Similarity: ${(row.similarity * 100).toFixed(1)}%`);
			console.log(`   Preview: ${row.preview}...`);
		});

		// Step 6: Semantic search WITH Discovery filter
		console.log('\n📊 Step 6: Semantic search (WITH Discovery filter)...\n');

		const searchDiscovery = await db.query(`
			SELECT
				document_title,
				provider,
				LEFT(content, 150) as preview,
				1 - (embedding <=> $1::vector) AS similarity
			FROM document_chunks
			WHERE embedding IS NOT NULL
			AND provider = 'Discovery Health Medical Scheme'
			ORDER BY embedding <=> $1::vector
			LIMIT 5
		`, [JSON.stringify(queryEmbedding)]);

		console.log('Top 5 results (Discovery only):');
		if (searchDiscovery.rows.length === 0) {
			console.log('❌ NO RESULTS FOUND!');

			// Check what providers we actually have
			const providers = await db.query(`
				SELECT DISTINCT provider FROM document_chunks WHERE embedding IS NOT NULL
			`);
			console.log('\nAvailable providers in database:');
			providers.rows.forEach(row => console.log(`  - "${row.provider}"`));

		} else {
			searchDiscovery.rows.forEach((row, i) => {
				console.log(`\n${i + 1}. ${row.document_title} (${row.provider})`);
				console.log(`   Similarity: ${(row.similarity * 100).toFixed(1)}%`);
				console.log(`   Preview: ${row.preview}...`);
			});
		}

		// Step 7: Check exact provider name
		console.log('\n📊 Step 7: Testing different provider name patterns...\n');

		const providerPatterns = [
			'Discovery Health Medical Scheme',
			'Discovery Health',
			'Discovery',
		];

		for (const pattern of providerPatterns) {
			const count = await db.query(`
				SELECT COUNT(*) as count
				FROM document_chunks
				WHERE provider = $1 AND embedding IS NOT NULL
			`, [pattern]);

			console.log(`Provider: "${pattern}" -> ${count.rows[0].count} chunks`);
		}

	} catch (error) {
		console.error('❌ Error:', error);
	} finally {
		await db.end();
	}
}

debugQuery().catch(console.error);

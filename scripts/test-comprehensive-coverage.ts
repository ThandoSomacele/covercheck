import { config } from 'dotenv';
import { semanticSearch } from '../src/lib/server/rag-semantic';

config();

async function testComprehensiveCoverage() {
  console.log('🔍 Testing Comprehensive Coverage After Phase 2\n');
  console.log('=' .repeat(60) + '\n');

  // Test 1: Original failing query - Bonitas maternity
  console.log('TEST 1: Bonitas Maternity Cost (Original Failing Query)');
  console.log('Question: "How much does maternity cover cost on Bonitas?"\n');

  const maternityResults = await semanticSearch(
    'How much does maternity cover cost on Bonitas?',
    5,
    'Bonitas Medical Fund'
  );

  console.log(`📊 Found ${maternityResults.length} relevant chunks:\n`);

  maternityResults.forEach((result, i) => {
    console.log(`  Result ${i + 1}:`);
    console.log(`    Document: ${result.documentTitle}`);
    console.log(`    Provider: ${result.provider}`);
    console.log(`    Similarity: ${(result.similarity * 100).toFixed(2)}%`);
    console.log(`    Content Preview: ${result.content.substring(0, 150).replace(/\n/g, ' ')}...`);
    console.log();
  });

  console.log('=' .repeat(60) + '\n');

  // Test 2: Discovery plan comparison
  console.log('TEST 2: Discovery Plan Comparison');
  console.log('Question: "What are the differences between Discovery Executive and Comprehensive plans?"\n');

  const planResults = await semanticSearch(
    'What are the differences between Discovery Executive and Comprehensive plans?',
    5,
    'Discovery Health Medical Scheme'
  );

  console.log(`📊 Found ${planResults.length} relevant chunks:\n`);

  planResults.forEach((result, i) => {
    console.log(`  Result ${i + 1}:`);
    console.log(`    Document: ${result.documentTitle}`);
    console.log(`    Provider: ${result.provider}`);
    console.log(`    Similarity: ${(result.similarity * 100).toFixed(2)}%`);
    console.log(`    Content Preview: ${result.content.substring(0, 150).replace(/\n/g, ' ')}...`);
    console.log();
  });

  console.log('=' .repeat(60) + '\n');

  // Test 3: Hospital network query
  console.log('TEST 3: Hospital Network Information');
  console.log('Question: "Which hospitals are in the Discovery network?"\n');

  const networkResults = await semanticSearch(
    'Which hospitals are in the Discovery network?',
    5,
    'Discovery Health Medical Scheme'
  );

  console.log(`📊 Found ${networkResults.length} relevant chunks:\n`);

  networkResults.forEach((result, i) => {
    console.log(`  Result ${i + 1}:`);
    console.log(`    Document: ${result.documentTitle}`);
    console.log(`    Provider: ${result.provider}`);
    console.log(`    Similarity: ${(result.similarity * 100).toFixed(2)}%`);
    console.log(`    Content Preview: ${result.content.substring(0, 150).replace(/\n/g, ' ')}...`);
    console.log();
  });

  console.log('=' .repeat(60) + '\n');

  // Test 4: PMB benefits query
  console.log('TEST 4: PMB Benefits Information');
  console.log('Question: "What are the prescribed minimum benefits for chronic conditions?"\n');

  const pmbResults = await semanticSearch(
    'What are the prescribed minimum benefits for chronic conditions?',
    5
  );

  console.log(`📊 Found ${pmbResults.length} relevant chunks:\n`);

  pmbResults.forEach((result, i) => {
    console.log(`  Result ${i + 1}:`);
    console.log(`    Document: ${result.documentTitle}`);
    console.log(`    Provider: ${result.provider}`);
    console.log(`    Similarity: ${(result.similarity * 100).toFixed(2)}%`);
    console.log(`    Content Preview: ${result.content.substring(0, 150).replace(/\n/g, ' ')}...`);
    console.log();
  });

  console.log('=' .repeat(60));
  console.log('\n✨ Coverage Testing Complete!\n');

  // Summary
  console.log('📈 SUMMARY:');
  console.log(`   Maternity queries: ${maternityResults.length > 0 ? '✅ FIXED' : '❌ Still broken'}`);
  console.log(`   Plan comparison: ${planResults.length > 0 ? '✅ Working' : '❌ No results'}`);
  console.log(`   Network info: ${networkResults.length > 0 ? '✅ Working' : '❌ No results'}`);
  console.log(`   PMB benefits: ${pmbResults.length > 0 ? '✅ Working' : '❌ No results'}`);
  console.log();
}

testComprehensiveCoverage()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Error during testing:', error);
    process.exit(1);
  });

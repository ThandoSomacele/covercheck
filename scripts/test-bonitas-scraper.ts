import { BonitasPDFScraper } from '../src/lib/server/scrapers/BonitasPDFScraper.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function testBonitasScraper() {
  console.log('🧪 Testing Bonitas PDF Scraper\n');

  const scraper = new BonitasPDFScraper();

  try {
    const documents = await scraper.scrape();

    // Ensure scraped-data directory exists
    const scrapedDataDir = join(process.cwd(), 'scraped-data');
    mkdirSync(scrapedDataDir, { recursive: true });

    // Show summary
    console.log('\n📊 Scrape Summary:\n');
    console.log(`Total documents: ${documents.length}`);
    console.log(`Average content length: ${Math.round(documents.reduce((sum, doc) => sum + doc.content.length, 0) / documents.length)} chars`);

    // Group by category
    const byCategory: Record<string, number> = {};
    documents.forEach(doc => {
      const category = doc.metadata.category as string;
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    console.log('\nBy Category:');
    Object.entries(byCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} plans`);
    });

    // Save to file
    const output = {
      metadata: {
        scrapedAt: new Date().toISOString(),
        totalDocuments: documents.length,
        provider: 'Bonitas Medical Fund'
      },
      documents
    };

    const filename = `bonitas-pdfs-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = join(process.cwd(), 'scraped-data', filename);

    writeFileSync(filepath, JSON.stringify(output, null, 2));
    console.log(`\n💾 Saved to: ${filename}`);

    // Show sample
    console.log('\n📄 Sample document:');
    const sample = documents[0];
    console.log(`  Title: ${sample.title}`);
    console.log(`  URL: ${sample.url}`);
    console.log(`  Content preview: ${sample.content.substring(0, 200)}...`);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testBonitasScraper();

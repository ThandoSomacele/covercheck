import { config } from 'dotenv';
import { DocumentProcessor } from '../src/lib/server/document-processor';
import { join } from 'path';

config();

async function testPdfExtraction() {
  console.log('🧪 Testing PDF Text Extraction\n');
  console.log('=' .repeat(60) + '\n');

  const connectionString = process.env.DB_CONNECTION_STRING;
  if (!connectionString) {
    console.error('❌ DB_CONNECTION_STRING not found in .env');
    process.exit(1);
  }

  const processor = new DocumentProcessor(connectionString);

  try {
    await processor.connect();
    console.log('✅ Connected to database\n');

    // Test with the Bonitas Maternity Guide
    const testPdf = join(
      process.cwd(),
      'scraped-data',
      'downloaded-pdfs',
      'bonitas',
      '2025_maternity_programme_guide_2025.pdf'
    );

    console.log(`📖 Testing PDF extraction from:\n   ${testPdf}\n`);

    const testDoc = {
      title: 'Test: Maternity Programme Guide 2025',
      url: 'https://www.bonitas.co.za/wp-content/uploads/2025/08/2025-How-to-Mother-and-Childcare.pdf',
      content: '',
      provider: 'Bonitas Medical Fund',
      metadata: {
        type: 'guide',
        year: '2025',
        filepath: testPdf
      }
    };

    // Process the document (will extract PDF text)
    await processor.processDocument(testDoc);

    console.log('\n' + '=' .repeat(60));
    console.log('\n✅ PDF extraction test completed successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await processor.disconnect();
    console.log('📡 Database connection closed\n');
  }
}

testPdfExtraction()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

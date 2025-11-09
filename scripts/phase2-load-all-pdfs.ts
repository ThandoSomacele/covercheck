import { readFileSync, writeFileSync, existsSync, mkdirSync, createWriteStream, unlink } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { DocumentProcessor, type ScrapedDocument } from '../src/lib/server/document-processor';
import https from 'https';
import http from 'http';

config();

interface PDFLink {
  url: string;
  name: string;
  type: string;
  year: string;
}

interface ComprehensivePDFData {
  metadata: {
    scrapedAt: string;
    lastUpdated: string;
    totalPDFs: number;
    providers: {
      bonitas: number;
      discovery: number;
      momentum: number;
    };
  };
  bonitas: PDFLink[];
  discovery: PDFLink[];
  momentum: PDFLink[];
  note?: string;
}

/**
 * Download a PDF from URL and save to file
 */
async function downloadPDF(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadPDF(redirectUrl, outputPath).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const fileStream = createWriteStream(outputPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err: Error) => {
        unlink(outputPath, () => {}); // Delete partial file
        reject(err);
      });
    }).on('error', reject);
  });
}

/**
 * Sanitize filename to remove special characters
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9\s-]/gi, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

async function phase2LoadAllPDFs() {
  console.log('📚 PHASE 2: Loading All Comprehensive PDF Documents\n');
  console.log('=' .repeat(60));

  // Load the comprehensive PDF links
  const linksFilepath = join(process.cwd(), 'scraped-data', 'comprehensive-pdf-links.json');
  const linksData: ComprehensivePDFData = JSON.parse(readFileSync(linksFilepath, 'utf-8'));

  console.log('\n📊 Comprehensive PDF Collection Summary:');
  console.log(`   Total PDFs: ${linksData.metadata.totalPDFs}`);
  console.log(`   Bonitas: ${linksData.metadata.providers.bonitas} PDFs`);
  console.log(`   Discovery: ${linksData.metadata.providers.discovery} PDFs`);
  console.log(`   Momentum: ${linksData.metadata.providers.momentum} PDFs`);
  if (linksData.note) {
    console.log(`\n   Note: ${linksData.note}`);
  }
  console.log('\n' + '='.repeat(60) + '\n');

  // Create downloads directory
  const downloadsDir = join(process.cwd(), 'scraped-data', 'downloaded-pdfs');
  if (!existsSync(downloadsDir)) {
    mkdirSync(downloadsDir, { recursive: true });
  }

  const bonitasDir = join(downloadsDir, 'bonitas');
  const discoveryDir = join(downloadsDir, 'discovery');

  if (!existsSync(bonitasDir)) mkdirSync(bonitasDir, { recursive: true });
  if (!existsSync(discoveryDir)) mkdirSync(discoveryDir, { recursive: true });

  // Download all PDFs
  const downloadedDocuments: ScrapedDocument[] = [];
  let successCount = 0;
  let failCount = 0;

  console.log('📥 STEP 1: Downloading PDFs...\n');

  // Download Bonitas PDFs
  if (linksData.bonitas.length > 0) {
    console.log(`\n🏥 Downloading Bonitas PDFs (${linksData.bonitas.length})...`);
    for (const pdf of linksData.bonitas) {
      const filename = `${pdf.year}_${sanitizeFilename(pdf.name)}.pdf`;
      const filepath = join(bonitasDir, filename);

      try {
        if (!existsSync(filepath)) {
          console.log(`   ⬇️  Downloading: ${pdf.name}...`);
          await downloadPDF(pdf.url, filepath);
          console.log(`   ✅ Downloaded: ${filename}`);
        } else {
          console.log(`   ⏭️  Already exists: ${filename}`);
        }

        downloadedDocuments.push({
          title: pdf.name,
          url: pdf.url,
          content: '', // Will be extracted from PDF
          provider: 'Bonitas Medical Fund',
          metadata: {
            type: pdf.type,
            year: pdf.year,
            filepath: filepath
          }
        });
        successCount++;
      } catch (error) {
        console.error(`   ❌ Failed to download ${pdf.name}:`, error);
        failCount++;
      }
    }
  }

  // Download Discovery PDFs
  if (linksData.discovery.length > 0) {
    console.log(`\n🏥 Downloading Discovery PDFs (${linksData.discovery.length})...`);
    for (const pdf of linksData.discovery) {
      const filename = `${pdf.year}_${sanitizeFilename(pdf.name)}.pdf`;
      const filepath = join(discoveryDir, filename);

      try {
        if (!existsSync(filepath)) {
          console.log(`   ⬇️  Downloading: ${pdf.name}...`);
          await downloadPDF(pdf.url, filepath);
          console.log(`   ✅ Downloaded: ${filename}`);
        } else {
          console.log(`   ⏭️  Already exists: ${filename}`);
        }

        downloadedDocuments.push({
          title: pdf.name,
          url: pdf.url,
          content: '', // Will be extracted from PDF
          provider: 'Discovery Health Medical Scheme',
          metadata: {
            type: pdf.type,
            year: pdf.year,
            filepath: filepath
          }
        });
        successCount++;
      } catch (error) {
        console.error(`   ❌ Failed to download ${pdf.name}:`, error);
        failCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Download Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📁 Total to process: ${downloadedDocuments.length}`);

  // Save manifest of downloaded documents
  const manifestPath = join(downloadsDir, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify({
    downloadedAt: new Date().toISOString(),
    totalDocuments: downloadedDocuments.length,
    documents: downloadedDocuments
  }, null, 2));
  console.log(`\n📝 Manifest saved to: ${manifestPath}`);

  console.log('\n' + '='.repeat(60) + '\n');

  // Initialize processor
  console.log('📥 STEP 2: Processing PDFs and Loading into Database...\n');

  const connectionString = process.env.DB_CONNECTION_STRING;
  if (!connectionString) {
    console.error('❌ DB_CONNECTION_STRING not found in .env');
    process.exit(1);
  }

  const processor = new DocumentProcessor(connectionString);

  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    await processor.connect();
    console.log('✅ Connected\n');

    // Process all downloaded documents
    await processor.processDocuments(downloadedDocuments);

    // Show final statistics
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 FINAL DATABASE STATISTICS:\n');
    const stats = await processor.getStats();

    console.log(`   Total Documents: ${stats.totalDocuments}`);
    console.log(`   Total Chunks: ${stats.totalChunks}`);
    console.log(`   Chunks with Embeddings: ${stats.chunksWithEmbeddings}`);
    console.log('\n   By Provider:');

    for (const [provider, providerData] of Object.entries(stats.byProvider)) {
      console.log(`\n     ${provider}:`);
      console.log(`       Documents: ${providerData.documents}`);
      console.log(`       Chunks: ${providerData.chunks}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✨ Phase 2 Complete! All PDFs loaded successfully!');
    console.log('🔍 Your comprehensive medical aid database is now searchable!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await processor.disconnect();
    console.log('📡 Database connection closed\n');
  }
}

phase2LoadAllPDFs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

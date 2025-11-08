import * as pdfjsLib from 'pdfjs-dist';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.mjs';

async function testSinglePDF() {
  console.log('🧪 Testing single PDF extraction\n');

  const testPDF = {
    name: 'BonStart / BonStart Plus',
    url: 'https://www.bonitas.co.za/wp-content/uploads/2025/10/Bonstart-Bonstart-plus-2026.pdf'
  };

  try {
    console.log(`📄 Downloading: ${testPDF.name}`);
    console.log(`   URL: ${testPDF.url}\n`);

    // Use fetch to download PDF
    const response = await fetch(testPDF.url);

    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.status}`);
    }

    console.log('✅ PDF downloaded');
    console.log('📊 Extracting text...\n');

    const arrayBuffer = await response.arrayBuffer();

    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    console.log(`   Pages: ${pdf.numPages}`);

    // Extract text from all pages
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    console.log(`✅ Extraction complete!`);
    console.log(`   Text length: ${fullText.length} characters`);
    console.log(`\n📝 First 500 characters:\n`);
    console.log(fullText.substring(0, 500));
    console.log('\n...\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testSinglePDF();

import { chromium } from 'playwright';

async function testBonitasPDFs() {
  console.log('🔍 Testing Bonitas PDF extraction...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('📂 Navigating to Bonitas plans page...');
    await page.goto('https://www.bonitas.co.za/our-plans-2026/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('⏳ Waiting for page to load...\n');
    await page.waitForTimeout(3000);

    // Find all PDF links
    const pdfLinks = await page.$$eval('a[href$=".pdf"]', (links) =>
      links.map((link) => ({
        text: link.textContent?.trim() || '',
        href: (link as HTMLAnchorElement).href,
        title: link.getAttribute('title') || ''
      }))
    );

    console.log(`📄 Found ${pdfLinks.length} PDF links:\n`);

    pdfLinks.forEach((link, index) => {
      console.log(`${index + 1}. ${link.text || link.title}`);
      console.log(`   URL: ${link.href}`);
      console.log('');
    });

    // Try to find tabs or sections
    const tabs = await page.$$eval('[role="tab"], .tab, button[data-tab]', (elements) =>
      elements.map((el) => ({
        text: el.textContent?.trim() || '',
        class: el.className,
        role: el.getAttribute('role') || '',
        dataTab: el.getAttribute('data-tab') || ''
      }))
    );

    if (tabs.length > 0) {
      console.log(`\n🔖 Found ${tabs.length} tabs/sections:\n`);
      tabs.forEach((tab, index) => {
        console.log(`${index + 1}. ${tab.text}`);
        console.log(`   Class: ${tab.class}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

testBonitasPDFs();

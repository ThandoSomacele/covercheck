import { chromium } from 'playwright';

async function exploreBonitasTabs() {
  console.log('🔍 Exploring Bonitas plan page with tabs...\n');

  const browser = await chromium.launch({ headless: false }); // Set to false to see what's happening
  const page = await browser.newPage();

  try {
    console.log('📂 Navigating to Bonitas plans page...');
    await page.goto('https://www.bonitas.co.za/our-plans-2026/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('⏳ Waiting for content to load...\n');
    await page.waitForTimeout(3000);

    // Find all plan sections/accordions
    const sections = await page.$$eval('[class*="plan"], [class*="accordion"], section, .tab-content',
      (elements) => elements.map(el => ({
        className: el.className,
        id: el.id,
        text: el.textContent?.substring(0, 100)
      }))
    );

    console.log(`Found ${sections.length} potential sections\n`);

    // Look for tabs within the page
    const tabs = await page.$$eval('button[role="tab"], .tab, [data-tab], a[href*="#"]',
      (elements) => elements.map(el => ({
        text: el.textContent?.trim(),
        role: el.getAttribute('role'),
        dataTab: el.getAttribute('data-tab'),
        href: el.getAttribute('href'),
        ariaControls: el.getAttribute('aria-controls')
      }))
    );

    console.log(`🔖 Found ${tabs.length} tabs:\n`);
    tabs.forEach((tab, i) => {
      console.log(`${i + 1}. "${tab.text}"`);
      console.log(`   Role: ${tab.role || 'N/A'}`);
      console.log(`   Data-tab: ${tab.dataTab || 'N/A'}`);
      console.log(`   Href: ${tab.href || 'N/A'}`);
      console.log(`   Aria-controls: ${tab.ariaControls || 'N/A'}`);
      console.log('');
    });

    // Try clicking on tabs and finding PDFs
    console.log('\n📄 Looking for PDFs after clicking tabs...\n');

    const allTabs = await page.$$('button[role="tab"], .tab');

    for (let i = 0; i < Math.min(allTabs.length, 10); i++) {
      try {
        const tab = allTabs[i];
        const tabText = await tab.textContent();

        console.log(`\nClicking tab ${i + 1}: "${tabText?.trim()}"`);
        await tab.click();
        await page.waitForTimeout(1000);

        // Find PDFs visible after this tab click
        const pdfs = await page.$$eval('a[href$=".pdf"]', (links) =>
          links.map((link) => ({
            text: link.textContent?.trim(),
            href: (link as HTMLAnchorElement).href
          }))
        );

        console.log(`   Found ${pdfs.length} PDFs:`);
        pdfs.forEach(pdf => {
          console.log(`     - ${pdf.text}: ${pdf.href}`);
        });

      } catch (error) {
        console.log(`   Error clicking tab: ${error}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

exploreBonitasTabs();

import * as pdfjsLib from 'pdfjs-dist';
import type { ScrapedDocument } from './types.js';

// Set worker path for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.mjs';

/**
 * Enhanced Bonitas scraper that extracts content from PDFs
 *
 * Bonitas provides their plan information as downloadable PDFs.
 * This scraper downloads and extracts text from each plan's PDF brochure.
 */
export class BonitasPDFScraper {
	private provider = 'Bonitas Medical Fund';
	private baseUrl = 'https://www.bonitas.co.za';

	/**
	 * List of known Bonitas 2026 plan PDFs
	 * Extracted from https://www.bonitas.co.za/our-plans-2026/
	 */
	private planPDFs = [
		{
			name: 'BonStart / BonStart Plus',
			url: 'https://www.bonitas.co.za/wp-content/uploads/2025/10/Bonstart-Bonstart-plus-2026.pdf',
			category: 'Traditional Plans'
		},
		{
			name: 'Primary',
			url: 'https://www.bonitas.co.za/wp-content/uploads/2025/10/Primary-2026.pdf',
			category: 'Traditional Plans'
		},
		{
			name: 'Standard / Standard Select',
			url: 'https://www.bonitas.co.za/wp-content/uploads/2025/10/Standard-Standard-Select-2026.pdf',
			category: 'Traditional Plans'
		},
		{
			name: 'BonComprehensive / BonComplete',
			url: 'https://www.bonitas.co.za/wp-content/uploads/2025/10/BonComprehensive-BonComplete-2026.pdf',
			category: 'Comprehensive Plans'
		},
		{
			name: 'BonPrime',
			url: 'https://www.bonitas.co.za/wp-content/uploads/2025/10/BonPrime-2026.pdf',
			category: 'Comprehensive Plans'
		},
		{
			name: 'BonSave / BonFit',
			url: 'https://www.bonitas.co.za/wp-content/uploads/2025/10/BonSave-BonFit-2026.pdf',
			category: 'Comprehensive Plans'
		},
		{
			name: 'BonClassic',
			url: 'https://www.bonitas.co.za/wp-content/uploads/2025/10/BonClassic-2026.pdf',
			category: 'Comprehensive Plans'
		},
		{
			name: 'BonCore',
			url: 'https://www.bonitas.co.za/wp-content/uploads/2025/10/BonCore-2026-1.pdf',
			category: 'Hospital Plans'
		},
		{
			name: 'BonEssential / BonEssential Select',
			url: 'https://www.bonitas.co.za/wp-content/uploads/2025/10/BonEssential-BonEssential-Select-2026.pdf',
			category: 'Hospital Plans'
		},
		{
			name: 'Hospital Standard',
			url: 'https://www.bonitas.co.za/wp-content/uploads/2025/10/Hospital-Standard-2026.pdf',
			category: 'Hospital Plans'
		},
		{
			name: 'BonCap',
			url: 'https://www.bonitas.co.za/wp-content/uploads/2025/10/BonCap-2026.pdf',
			category: 'Network Plans'
		}
	];

	/**
	 * Download and extract text from a PDF
	 */
	private async extractPDFText(url: string): Promise<string> {
		// Download PDF using fetch
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Failed to download PDF: ${response.status}`);
		}

		// Get PDF as array buffer
		const arrayBuffer = await response.arrayBuffer();

		// Load PDF document
		const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

		// Extract text from all pages
		let fullText = '';
		for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
			const page = await pdf.getPage(pageNum);
			const textContent = await page.getTextContent();
			const pageText = textContent.items.map((item: any) => item.str).join(' ');
			fullText += pageText + '\n\n';
		}

		return fullText;
	}

	/**
	 * Generate unique ID for a plan document
	 */
	private generateId(planName: string, url: string): string {
		const urlHash = Buffer.from(url).toString('base64url').substring(0, 10);
		const sanitized = planName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
		return `bonitas-medical-fund-plan_overview-${sanitized}-${urlHash}`;
	}

	/**
	 * Scrape a single plan PDF
	 */
	private async scrapePlanPDF(plan: {
		name: string;
		url: string;
		category: string;
	}): Promise<ScrapedDocument> {
		console.log(`   📄 ${plan.name}...`);

		try {
			const text = await this.extractPDFText(plan.url);

			const document: ScrapedDocument = {
				id: this.generateId(plan.name, plan.url),
				title: `${plan.name} - ${plan.category}`,
				content: text,
				url: plan.url,
				contentType: 'plan_overview',
				provider: this.provider,
				scrapedAt: new Date().toISOString(),
				metadata: {
					pageUrl: plan.url,
					category: plan.category,
					planName: plan.name,
					source: 'pdf'
				}
			};

			console.log(`      ✅ Extracted ${text.length} characters`);
			return document;

		} catch (error) {
			console.error(`      ❌ Failed: ${error}`);
			throw error;
		}
	}

	/**
	 * Scrape all Bonitas plan PDFs
	 */
	async scrape(): Promise<ScrapedDocument[]> {
		console.log(`\n🏥 Starting Bonitas Medical Fund PDF scrape...`);
		console.log(`📋 Scraping ${this.planPDFs.length} plan PDFs\n`);

		const documents: ScrapedDocument[] = [];
		const errors: Array<{ plan: string; error: any }> = [];

		for (const plan of this.planPDFs) {
			try {
				const doc = await this.scrapePlanPDF(plan);
				documents.push(doc);

				// Rate limiting - wait 2 seconds between PDFs
				await new Promise(resolve => setTimeout(resolve, 2000));

			} catch (error) {
				errors.push({ plan: plan.name, error });
			}
		}

		console.log(`\n✅ Successfully scraped ${documents.length}/${this.planPDFs.length} PDFs`);

		if (errors.length > 0) {
			console.log(`\n⚠️  Errors (${errors.length}):`);
			errors.forEach(({ plan, error }) => {
				console.log(`   - ${plan}: ${error.message}`);
			});
		}

		return documents;
	}
}

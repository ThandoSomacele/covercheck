import * as pdfjsLib from 'pdfjs-dist';
import type { ScrapedDocument } from './types.js';

// Set worker path for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.mjs';

/**
 * Discovery Health PDF scraper for plan guides
 *
 * Extracts comprehensive plan information from official Discovery Health
 * plan guide PDFs available at discovery.co.za/medical-aid/find-documents
 */
export class DiscoveryPDFScraper {
	private provider = 'Discovery Health';
	private baseUrl = 'https://www.discovery.co.za';

	/**
	 * List of Discovery Health 2025 plan guide PDFs
	 * Source: https://www.discovery.co.za/medical-aid/find-documents
	 */
	private planPDFs = [
		{
			name: 'Executive Plan Guide',
			url: 'https://www.discovery.co.za/wcm/discoverycoza/assets/faz/medical-aid/2025/health-plan-guides/discovery-health-medical-scheme-executive-plan-guide.pdf',
			category: 'Plan Guides'
		},
		{
			name: 'Comprehensive Series Plan Guide',
			url: 'https://www.discovery.co.za/wcm/discoverycoza/assets/faz/medical-aid/2025/health-plan-guides/discovery-health-medical-scheme-comprehensive-plan-guide.pdf',
			category: 'Plan Guides'
		},
		{
			name: 'Priority Series Plan Guide',
			url: 'https://www.discovery.co.za/wcm/discoverycoza/assets/faz/medical-aid/2025/health-plan-guides/discovery-health-medical-scheme-priority-plan-guide.pdf',
			category: 'Plan Guides'
		},
		{
			name: 'Saver Series Plan Guide',
			url: 'https://www.discovery.co.za/wcm/discoverycoza/assets/faz/medical-aid/2025/health-plan-guides/discovery-health-medical-scheme-saver-plan-guide.pdf',
			category: 'Plan Guides'
		},
		{
			name: 'Smart Series Plan Guide',
			url: 'https://www.discovery.co.za/wcm/discoverycoza/assets/faz/medical-aid/2025/health-plan-guides/discovery-health-medical-scheme-smart-plan-guide.pdf',
			category: 'Plan Guides'
		},
		{
			name: 'Core Series Plan Guide',
			url: 'https://www.discovery.co.za/wcm/discoverycoza/assets/faz/medical-aid/2025/health-plan-guides/discovery-health-medical-scheme-core-plan-guide.pdf',
			category: 'Plan Guides'
		},
		{
			name: 'KeyCare Series Plan Guide',
			url: 'https://www.discovery.co.za/wcm/discoverycoza/assets/faz/medical-aid/2025/health-plan-guides/discovery-health-medical-scheme-keycare-plan-guide.pdf',
			category: 'Plan Guides'
		},
		{
			name: 'Plan Contribution Rates',
			url: 'https://www.discovery.co.za/wcm/discoverycoza/assets/faz/medical-aid/2025/benefit-information/contribution-table.pdf',
			category: 'Reference'
		},
		{
			name: 'Plan Comparison Guide',
			url: 'https://www.discovery.co.za/wcm/discoverycoza/assets/faz/medical-aid/2025/benefit-information/discovery-health-medical-scheme-plan-comparison.pdf',
			category: 'Reference'
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
		return `discovery-health-plan_guide-${sanitized}-${urlHash}`;
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
				title: plan.name,
				content: text,
				url: plan.url,
				contentType: 'plan_overview',
				provider: this.provider,
				scrapedAt: new Date().toISOString(),
				metadata: {
					pageUrl: plan.url,
					category: plan.category,
					planName: plan.name,
					source: 'pdf',
					year: '2025'
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
	 * Scrape all Discovery Health plan PDFs
	 */
	async scrape(): Promise<ScrapedDocument[]> {
		console.log(`\n🏥 Starting Discovery Health PDF scrape...`);
		console.log(`📋 Scraping ${this.planPDFs.length} plan guide PDFs\n`);

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

import pg from 'pg';
import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { getEmbeddingProvider } from './embedding-service';

const require = createRequire(import.meta.url);
const { PdfReader } = require('pdfreader');

const { Client } = pg;

/**
 * Document from scraped data
 */
export interface ScrapedDocument {
  id?: string;
  title: string;
  content: string;
  url: string;
  contentType?: string;
  provider: string;
  scrapedAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * A chunk of text from a document
 */
export interface DocumentChunk {
  documentId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  provider: string;
  documentTitle: string;
  documentUrl: string;
}

/**
 * Configuration for chunking strategy
 */
export interface ChunkingConfig {
  targetSize: number;  // Target characters per chunk
  maxSize: number;     // Maximum characters per chunk
  overlap: number;     // Overlap between chunks
  separators: string[]; // Hierarchy of separators to try
}

/**
 * Default chunking configuration
 * Optimized for medical aid documents
 */
const DEFAULT_CHUNKING_CONFIG: ChunkingConfig = {
  targetSize: 4000,   // ~1000 tokens
  maxSize: 6000,      // ~1500 tokens
  overlap: 400,       // ~100 tokens
  separators: [
    '\n\n\n',  // Section breaks
    '\n\n',    // Paragraph breaks
    '\n',      // Line breaks
    '. ',      // Sentences
    ' '        // Words (last resort)
  ]
};

/**
 * Document Processor
 * Handles loading, chunking, embedding, and storing documents
 */
export class DocumentProcessor {
  private db: pg.Client;
  private config: ChunkingConfig;

  constructor(
    connectionString: string,
    config: ChunkingConfig = DEFAULT_CHUNKING_CONFIG
  ) {
    this.db = new Client({ connectionString });
    this.config = config;
  }

  /**
   * Connect to database
   */
  async connect(): Promise<void> {
    await this.db.connect();
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    await this.db.end();
  }

  /**
   * Chunk a document into smaller pieces using recursive splitting
   */
  chunkDocument(doc: ScrapedDocument): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const content = doc.content;

    if (content.length <= this.config.targetSize) {
      // Document is small enough, no chunking needed
      chunks.push({
        documentId: doc.id,
        chunkIndex: 0,
        content: content,
        tokenCount: Math.ceil(content.length / 4), // Rough estimate
        provider: doc.provider,
        documentTitle: doc.title,
        documentUrl: doc.url
      });
      return chunks;
    }

    // Recursive splitting
    const pieces = this.recursiveSplit(content, this.config);

    pieces.forEach((piece, index) => {
      chunks.push({
        documentId: doc.id,
        chunkIndex: index,
        content: piece,
        tokenCount: Math.ceil(piece.length / 4), // Rough estimate
        provider: doc.provider,
        documentTitle: doc.title,
        documentUrl: doc.url
      });
    });

    return chunks;
  }

  /**
   * Recursively split text using separator hierarchy
   */
  private recursiveSplit(text: string, config: ChunkingConfig): string[] {
    const chunks: string[] = [];

    // Try each separator in order
    for (const separator of config.separators) {
      if (text.length <= config.maxSize) {
        chunks.push(text);
        break;
      }

      const parts = text.split(separator);
      let currentChunk = '';

      for (const part of parts) {
        const testChunk = currentChunk + (currentChunk ? separator : '') + part;

        if (testChunk.length > config.targetSize && currentChunk) {
          // Add overlap from previous chunk
          const overlap = currentChunk.slice(-config.overlap);
          chunks.push(currentChunk);
          currentChunk = overlap + separator + part;
        } else {
          currentChunk = testChunk;
        }
      }

      if (currentChunk) {
        chunks.push(currentChunk);
      }

      // If we successfully chunked, return
      if (chunks.every(chunk => chunk.length <= config.maxSize)) {
        return chunks;
      }

      // Otherwise, reset and try next separator
      chunks.length = 0;
    }

    // Fallback: force split by character
    if (chunks.length === 0) {
      for (let i = 0; i < text.length; i += config.targetSize - config.overlap) {
        chunks.push(text.slice(i, i + config.targetSize));
      }
    }

    return chunks;
  }

  /**
   * Generate embedding for text using configured provider
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // Add retry logic for connection errors
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const provider = getEmbeddingProvider();
        const embedding = await provider.generateEmbedding(text);
        return embedding;
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          console.log(`      ⚠️  Retry ${attempt}/${maxRetries}...`);
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError;
  }

  /**
   * Store document in database
   */
  async storeDocument(doc: ScrapedDocument): Promise<void> {
    await this.db.query(
      `INSERT INTO documents (id, title, content, url, provider, content_type, scraped_at, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         content = EXCLUDED.content,
         url = EXCLUDED.url,
         provider = EXCLUDED.provider,
         content_type = EXCLUDED.content_type,
         scraped_at = EXCLUDED.scraped_at,
         metadata = EXCLUDED.metadata,
         updated_at = NOW()`,
      [
        doc.id,
        doc.title,
        doc.content,
        doc.url,
        doc.provider,
        doc.contentType,
        doc.scrapedAt,
        JSON.stringify(doc.metadata)
      ]
    );
  }

  /**
   * Store chunk with embedding in database
   */
  async storeChunk(chunk: DocumentChunk, embedding: number[]): Promise<void> {
    await this.db.query(
      `INSERT INTO document_chunks (
        document_id, chunk_index, content, embedding, token_count,
        provider, document_title, document_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (document_id, chunk_index) DO UPDATE SET
        content = EXCLUDED.content,
        embedding = EXCLUDED.embedding,
        token_count = EXCLUDED.token_count,
        provider = EXCLUDED.provider,
        document_title = EXCLUDED.document_title,
        document_url = EXCLUDED.document_url`,
      [
        chunk.documentId,
        chunk.chunkIndex,
        chunk.content,
        JSON.stringify(embedding),
        chunk.tokenCount,
        chunk.provider,
        chunk.documentTitle,
        chunk.documentUrl
      ]
    );
  }

  /**
   * Extract text from PDF file using pdfreader
   */
  async extractPdfText(filepath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const textByPage: { [key: number]: string } = {};
      let currentPage = 0;

      new PdfReader().parseFileItems(filepath, (err: any, item: any) => {
        if (err) {
          console.error(`      ❌ Error extracting PDF text: ${err}`);
          reject(err);
        } else if (!item) {
          // End of file - combine all pages
          const fullText = Object.keys(textByPage)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(page => textByPage[parseInt(page)])
            .join('\n\n');
          resolve(fullText.trim());
        } else if (item.page) {
          // New page
          currentPage = item.page;
          if (!textByPage[currentPage]) {
            textByPage[currentPage] = '';
          }
        } else if (item.text) {
          // Text content
          if (!textByPage[currentPage]) {
            textByPage[currentPage] = '';
          }
          textByPage[currentPage] += item.text + ' ';
        }
      });
    });
  }

  /**
   * Process a single document: extract content if needed, chunk, embed, and store
   */
  async processDocument(doc: ScrapedDocument): Promise<void> {
    console.log(`📄 Processing: ${doc.title} (${doc.provider})`);

    // Generate ID if not provided (use URL hash or title-based ID)
    if (!doc.id) {
      doc.id = this.generateDocumentId(doc.url, doc.title);
    }

    // Set defaults for optional fields
    if (!doc.contentType) {
      doc.contentType = doc.metadata?.filepath ? 'application/pdf' : 'text/html';
    }
    if (!doc.scrapedAt) {
      doc.scrapedAt = new Date().toISOString();
    }
    if (!doc.metadata) {
      doc.metadata = {};
    }

    // If content is empty and metadata has filepath, extract from PDF
    if (!doc.content && doc.metadata?.filepath) {
      console.log(`   📖 Extracting text from PDF...`);
      try {
        doc.content = await this.extractPdfText(doc.metadata.filepath as string);
        console.log(`   ✅ Extracted ${doc.content.length} characters from PDF`);
      } catch (error) {
        console.error(`   ❌ Failed to extract PDF text:`, error);
        throw error;
      }
    }

    // Skip if still no content
    if (!doc.content || doc.content.trim().length === 0) {
      console.log(`   ⚠️  Skipping: No content available\n`);
      return;
    }

    // Store original document
    await this.storeDocument(doc as Required<ScrapedDocument>);
    console.log(`   ✅ Stored document`);

    // Chunk the document
    const chunks = this.chunkDocument(doc as Required<ScrapedDocument>);
    console.log(`   📊 Created ${chunks.length} chunks`);

    // Generate embeddings and store chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`   🔄 Processing chunk ${i + 1}/${chunks.length}...`);

      const embedding = await this.generateEmbedding(chunk.content);
      await this.storeChunk(chunk, embedding);
    }

    console.log(`   ✅ Completed ${doc.id}\n`);
  }

  /**
   * Generate a unique document ID from URL or title
   */
  private generateDocumentId(url: string, title: string): string {
    // Use URL as base for ID, or fall back to title
    const base = url || title;
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < base.length; i++) {
      const char = base.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `doc_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Process multiple documents
   */
  async processDocuments(docs: ScrapedDocument[]): Promise<void> {
    console.log(`\n🚀 Processing ${docs.length} documents...\n`);

    for (const doc of docs) {
      try {
        await this.processDocument(doc);
      } catch (error) {
        console.error(`   ❌ Error processing ${doc.id}:`, error);
      }
    }

    console.log(`\n✅ All documents processed!`);
  }

  /**
   * Get statistics about processed documents
   */
  async getStats(): Promise<{
    totalDocuments: number;
    totalChunks: number;
    chunksWithEmbeddings: number;
    byProvider: Record<string, { documents: number; chunks: number }>;
  }> {
    const docResult = await this.db.query('SELECT COUNT(*) FROM documents');
    const chunkResult = await this.db.query('SELECT COUNT(*) FROM document_chunks');
    const embeddingResult = await this.db.query(
      'SELECT COUNT(*) FROM document_chunks WHERE embedding IS NOT NULL'
    );

    const providerResult = await this.db.query(`
      SELECT
        d.provider,
        COUNT(DISTINCT d.id) as documents,
        COUNT(c.id) as chunks
      FROM documents d
      LEFT JOIN document_chunks c ON d.id = c.document_id
      GROUP BY d.provider
    `);

    const byProvider: Record<string, { documents: number; chunks: number }> = {};
    for (const row of providerResult.rows) {
      byProvider[row.provider] = {
        documents: parseInt(row.documents),
        chunks: parseInt(row.chunks)
      };
    }

    return {
      totalDocuments: parseInt(docResult.rows[0].count),
      totalChunks: parseInt(chunkResult.rows[0].count),
      chunksWithEmbeddings: parseInt(embeddingResult.rows[0].count),
      byProvider
    };
  }
}

-- CoverCheck Phase 2: Database Schema Setup
-- PostgreSQL + pgvector for semantic search

-- Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Table 1: documents
-- Stores original scraped documents with full metadata
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT NOT NULL,
  provider TEXT NOT NULL,
  content_type TEXT NOT NULL,
  scraped_at TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast filtering on documents
CREATE INDEX IF NOT EXISTS idx_documents_provider ON documents(provider);
CREATE INDEX IF NOT EXISTS idx_documents_content_type ON documents(content_type);
CREATE INDEX IF NOT EXISTS idx_documents_scraped_at ON documents(scraped_at DESC);

-- Table 2: document_chunks
-- Stores chunked text with embeddings for RAG retrieval
CREATE TABLE IF NOT EXISTS document_chunks (
  id SERIAL PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(768),  -- 768 dimensions for nomic-embed-text
  token_count INTEGER,

  -- Denormalized fields for faster queries (avoid JOINs)
  provider TEXT NOT NULL,
  document_title TEXT NOT NULL,
  document_url TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique chunk per document
  UNIQUE(document_id, chunk_index)
);

-- Critical index for vector similarity search
-- Using IVFFlat algorithm with cosine distance
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for filtering by provider
CREATE INDEX IF NOT EXISTS idx_chunks_provider ON document_chunks(provider);

-- Index for finding all chunks of a document
CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON document_chunks(document_id);

-- Index for ordering by chunk position
CREATE INDEX IF NOT EXISTS idx_chunks_chunk_index ON document_chunks(document_id, chunk_index);

-- Statistics view for monitoring
CREATE OR REPLACE VIEW document_stats AS
SELECT
  provider,
  COUNT(DISTINCT id) as total_documents,
  COUNT(DISTINCT content_type) as content_types,
  MIN(scraped_at) as first_scraped,
  MAX(scraped_at) as last_scraped
FROM documents
GROUP BY provider;

-- Chunk statistics view
CREATE OR REPLACE VIEW chunk_stats AS
SELECT
  provider,
  COUNT(*) as total_chunks,
  COUNT(DISTINCT document_id) as documents_with_chunks,
  COUNT(embedding) as chunks_with_embeddings,
  AVG(token_count) as avg_token_count
FROM document_chunks
GROUP BY provider;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📊 Tables: documents, document_chunks';
  RAISE NOTICE '📈 Views: document_stats, chunk_stats';
  RAISE NOTICE '🔍 Vector dimensions: 768 (nomic-embed-text)';
END $$;

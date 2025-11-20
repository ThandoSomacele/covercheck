-- Migration: Change vector dimensions from 768 (Ollama) to 384 (Hugging Face)
-- This is required when switching from Ollama embeddings to Hugging Face embeddings

BEGIN;

-- Drop the views that depend on the embedding column
DROP VIEW IF EXISTS chunk_stats;

-- Drop the vector index first (it depends on the vector column type)
DROP INDEX IF EXISTS idx_chunks_embedding;

-- Alter the column to use 384 dimensions instead of 768
ALTER TABLE document_chunks
  ALTER COLUMN embedding TYPE VECTOR(384);

-- Recreate the index with 384 dimensions
CREATE INDEX idx_chunks_embedding ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Recreate the chunk_stats view
CREATE OR REPLACE VIEW chunk_stats AS
SELECT
  provider,
  COUNT(*) as total_chunks,
  COUNT(DISTINCT document_id) as documents_with_chunks,
  COUNT(embedding) as chunks_with_embeddings,
  AVG(token_count) as avg_token_count
FROM document_chunks
GROUP BY provider;

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Successfully migrated to 384-dimensional embeddings (Hugging Face)';
  RAISE NOTICE '📊 Vector column: VECTOR(384)';
  RAISE NOTICE '🔍 Index: Recreated with ivfflat';
END $$;

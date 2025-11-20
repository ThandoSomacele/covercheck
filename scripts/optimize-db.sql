-- CoverCheck Database Optimization Script
-- Run this to improve query performance and analyze statistics

-- Analyze tables to update statistics for query planner
ANALYZE documents;
ANALYZE document_chunks;

-- Add composite index for common query patterns (provider + embedding search)
CREATE INDEX IF NOT EXISTS idx_chunks_provider_embedding ON document_chunks(provider) 
WHERE embedding IS NOT NULL;

-- Add index for content search if needed
CREATE INDEX IF NOT EXISTS idx_chunks_content_trgm ON document_chunks 
USING gin(content gin_trgm_ops);

-- Vacuum to reclaim space and update statistics
VACUUM ANALYZE documents;
VACUUM ANALYZE document_chunks;

-- Display current database statistics
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Display index usage statistics
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database optimization complete!';
  RAISE NOTICE '📊 Statistics updated';
  RAISE NOTICE '🔍 Indexes optimized';
END $$;

# Next Steps: Fix PDF Text Extraction Quality

## Problem Summary

The PDF text extraction using `pdfreader` library produces garbled text with excessive spacing between characters, severely impacting semantic search quality.

**Example of garbled text:**
- "m a t ernity advi c e line" instead of "maternity advice line"
- "p r egnancy w ebina r s" instead of "pregnancy webinars"
- "c onsul ta tions and s c ans" instead of "consultations and scans"

**Impact:**
- Maternity guide chunks have low semantic similarity scores (below 36.5%)
- Discovery documents rank higher than Bonitas maternity content
- Vector search infrastructure works correctly, but text quality prevents good matches

## Current Status

✅ **Completed:**
- 75/76 PDFs successfully downloaded
- 430 chunks with embeddings (137 Bonitas, 293 Discovery)
- Maternity Programme Guide 2025 loaded with 4 chunks
- Vector search infrastructure fully functional
- PDF extraction pipeline working (but with quality issues)

❌ **Issues:**
- 1 document failed to process (Priority Plan downgrade form - Ollama crash)
- PDF text extraction produces garbled output with excessive character spacing
- Affects semantic search quality for Bonitas documents

## Next Steps

### Option 1: Try Alternative PDF Libraries (Recommended)

1. **Test pdf-parse library** (most popular alternative)
   ```bash
   npm install pdf-parse
   ```
   - Known for better text extraction quality
   - May handle character spacing better than pdfreader

2. **Test pdfjs-dist** (Mozilla's PDF.js)
   - Already in package.json but had worker issues
   - May need different configuration approach

3. **Compare extraction quality:**
   - Create test script to extract same PDF with different libraries
   - Compare output quality
   - Measure semantic similarity scores

### Option 2: Post-Process Extracted Text

If library switch doesn't work, implement text cleaning:

1. **Add text normalization function:**
   ```typescript
   function normalizeSpacing(text: string): string {
     // Remove excessive spaces between characters
     // Regex pattern to detect single-char words with spaces
     return text.replace(/\b([a-z])\s+(?=[a-z])/gi, '$1');
   }
   ```

2. **Apply in document-processor.ts:**
   - Add normalization step after PDF extraction
   - Before chunking and embedding generation

### Option 3: Hybrid Approach

1. Try alternative libraries first
2. If still needed, apply post-processing
3. Re-process affected documents

## Implementation Plan

### Phase 1: Test Alternative Libraries (30 min)
- [ ] Create `scripts/test-pdf-libraries.ts`
- [ ] Test pdf-parse on Bonitas Maternity Guide
- [ ] Test pdfjs-dist with different worker config
- [ ] Compare output quality
- [ ] Choose best library

### Phase 2: Update Document Processor (15 min)
- [ ] Update `src/lib/server/document-processor.ts`
- [ ] Replace pdfreader with chosen library
- [ ] Add text normalization if needed
- [ ] Test extraction on single PDF

### Phase 3: Re-process Affected Documents (30 min)
- [ ] Identify documents with spacing issues (Bonitas PDFs)
- [ ] Delete existing chunks for these documents
- [ ] Re-run processing with improved extraction
- [ ] Verify improved semantic similarity

### Phase 4: Validate Search Quality (15 min)
- [ ] Run maternity query test
- [ ] Verify Bonitas results appear in top 5
- [ ] Check similarity scores are > 60%
- [ ] Test with actual app interface

## Files to Keep

**Scripts to keep for next session:**
- `scripts/phase2-load-all-pdfs.ts` - Main processing pipeline
- `scripts/check-db-status.ts` - Monitor database state
- `scripts/find-missing-chunks.ts` - Identify incomplete documents
- `scripts/reprocess-missing-chunks.ts` - Re-process failed documents
- `scripts/check-maternity-content.ts` - Verify text quality
- `scripts/test-simple-query.ts` - Test semantic search

**Scripts to delete:**
- `scripts/test-pdf-extraction.ts` - One-time test, no longer needed
- `scripts/clear-database.ts` - Dangerous, keep but document carefully
- `scripts/inspect-embeddings.ts` - Debugging only
- `scripts/test-vector-search.ts` - Debugging only
- `scripts/test-raw-query.ts` - Debugging only
- `scripts/check-embedding-nulls.ts` - Debugging only
- `scripts/test-all-bonitas-chunks.ts` - Debugging only
- `scripts/test-rag-function.ts` - Failed due to SvelteKit deps
- `scripts/check-maternity-docs.ts` - Superseded by check-maternity-content.ts
- `scripts/list-bonitas-chunks.ts` - Debugging only
- `scripts/test-enhanced-search.ts` - If exists, old test
- `scripts/test-search.ts` - If exists, old test

## Key Learning

The PDF text extraction quality is **critical** for RAG performance. Even with perfect embeddings and vector search infrastructure, poor text quality will result in low semantic similarity scores. Always validate extracted text quality before generating embeddings.

## Resources

- pdf-parse: https://www.npmjs.com/package/pdf-parse
- pdfjs-dist: https://www.npmjs.com/package/pdfjs-dist
- Text normalization patterns: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions

## Database Connection Info

Connection string is in `.env` file as `DB_CONNECTION_STRING`
- Total documents: 75
- Total chunks: 430
- Bonitas chunks: 137
- Discovery chunks: 293

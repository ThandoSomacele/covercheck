# CoverCheck Deployment Guide

This guide covers deploying CoverCheck to production using Vercel (frontend) and Railway/Supabase (database).

## Prerequisites

- Node.js 18+ installed locally
- PostgreSQL database with pgvector extension (Railway or Supabase)
- OpenRouter API key
- Ollama running locally for embeddings (development) or cloud alternative (production)
- Git repository

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Vercel    │────▶│  OpenRouter  │     │   PostgreSQL    │
│  (Frontend) │     │   (LLM API)  │     │   + pgvector    │
│  SvelteKit  │     └──────────────┘     │  (Railway/      │
│             │                           │   Supabase)     │
│             │────────────────────────▶  │                 │
└─────────────┘                           └─────────────────┘
```

## Step 1: Database Setup

### Option A: Railway (Recommended)

1. Sign up at [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. In the database settings, add the pgvector extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Get the connection string from Railway dashboard
5. Run the schema setup:
   ```bash
   psql $DB_CONNECTION_STRING -f scripts/db-setup.sql
   ```

### Option B: Supabase

1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Go to SQL Editor and enable pgvector:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Copy the connection string (Settings → Database)
5. Run the schema setup:
   ```bash
   psql $DB_CONNECTION_STRING -f scripts/db-setup.sql
   ```

## Step 2: Load Data

1. Set up environment variables locally:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

2. Ensure Ollama is running with nomic-embed-text:
   ```bash
   ollama serve
   ollama pull nomic-embed-text
   ```

3. Load scraped documents into the database:
   ```bash
   npx tsx scripts/load-documents.ts
   ```

4. Verify data loaded correctly:
   ```bash
   npx tsx scripts/check-db-stats.ts
   ```

## Step 3: Deploy to Vercel

### Initial Setup

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link your project:
   ```bash
   vercel link
   ```

### Configure Environment Variables

In your Vercel project settings (or via CLI), set:

```bash
# Database
DB_CONNECTION_STRING=postgresql://user:pass@host:port/db

# OpenRouter API
OPENROUTER_API_KEY=sk-or-v1-your_key_here

# Production flag
NODE_ENV=production
```

### Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Step 4: Post-Deployment

### 1. Verify Deployment

- Visit your production URL
- Test a few queries
- Check provider selector works
- Verify citations display correctly

### 2. Optimize Database

Run the optimization script:
```bash
psql $DB_CONNECTION_STRING -f scripts/optimize-db.sql
```

### 3. Monitor Performance

Check these metrics:
- Query response time (should be < 3s)
- Database connection count
- OpenRouter API usage
- Error rates

## Production Considerations

### Database

- **Connection Pooling**: Consider using Supabase Pooler or pgBouncer
- **Backups**: Enable automated backups (both Railway and Supabase support this)
- **Scaling**: Monitor database size and consider upgrading plan if needed

### Ollama for Production

Current setup uses local Ollama for embeddings. For production, consider:

**Option 1: Cloud Ollama (Recommended)**
- Use a cloud-hosted Ollama instance
- Set OLLAMA_HOST environment variable to cloud URL

**Option 2: OpenRouter for Embeddings**
- Switch to OpenRouter's embedding API
- Update document-processor.ts to use cloud embeddings

**Option 3: Keep Local** (Not Recommended)
- Only viable if running on VM/VPS, not serverless
- Requires Ollama service running 24/7

### API Rate Limits

- OpenRouter free tier has rate limits
- Implement caching for frequently asked questions
- Consider upgrading to paid tier for production

### Security

- Never commit .env files
- Rotate API keys regularly
- Use read-only database credentials where possible
- Enable CORS properly

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DB_CONNECTION_STRING -c "SELECT version();"

# Check pgvector is enabled
psql $DB_CONNECTION_STRING -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

### Embedding Generation Fails

```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Test embedding generation
curl http://localhost:11434/api/embeddings -d '{
  "model": "nomic-embed-text",
  "prompt": "test"
}'
```

### Build Fails on Vercel

- Check Node.js version matches (18+)
- Ensure all dependencies are in package.json
- Check for TypeScript errors: `npm run check`

## Monitoring & Maintenance

### Regular Tasks

1. **Weekly**: Check database stats
   ```bash
   npx tsx scripts/check-db-stats.ts
   ```

2. **Monthly**: Optimize database
   ```bash
   psql $DB_CONNECTION_STRING -f scripts/optimize-db.sql
   ```

3. **Quarterly**: Update scraped content
   ```bash
   npm run scrape
   npx tsx scripts/load-documents.ts
   ```

### Metrics to Track

- Total queries per day
- Average response time
- Error rate
- Database size growth
- API costs (OpenRouter)

## Cost Estimates

### Free Tier (Development)
- Vercel: Free (Hobby plan)
- Railway: $5/month (basic PostgreSQL)
- OpenRouter: Free tier (with rate limits)
- **Total: $5/month**

### Production (Low Volume)
- Vercel: Free or $20/month (Pro)
- Railway: $10-20/month (PostgreSQL with more resources)
- OpenRouter: $10-50/month (depending on usage)
- **Total: $20-90/month**

## Support

For issues:
1. Check logs in Vercel dashboard
2. Check database logs in Railway/Supabase
3. Review error messages in browser console
4. Refer to CLAUDE.md for architecture details

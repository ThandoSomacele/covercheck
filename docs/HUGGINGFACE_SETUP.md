# Hugging Face Setup Guide

Get your FREE Hugging Face API key to enable cloud embeddings for CoverCheck.

## Why Hugging Face?

- ✅ **100% FREE** - No credit card required
- ✅ **Generous rate limits** - Perfect for production
- ✅ **Serverless compatible** - Works on Vercel
- ✅ **High quality embeddings** - sentence-transformers models
- ✅ **No cost migration path** - Switch to paid only if needed

## Step 1: Create Account

1. Go to [https://huggingface.co/join](https://huggingface.co/join)
2. Sign up with email or GitHub
3. Verify your email

## Step 2: Generate API Token

1. Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Click **"New token"**
3. Name it: `covercheck-embeddings`
4. Role: Select **"Read"** (sufficient for embedding API)
5. Click **"Generate a token"**
6. **Copy the token** (starts with `hf_...`)

## Step 3: Configure CoverCheck

### For Local Development

Add to your `.env` file:

```env
# Hugging Face Embeddings (FREE)
EMBEDDING_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_your_actual_token_here
```

### For Vercel Production

In Vercel dashboard (or CLI):

```bash
vercel env add EMBEDDING_PROVIDER
# Enter: huggingface

vercel env add HUGGINGFACE_API_KEY
# Paste your token: hf_your_actual_token_here
```

## Step 4: Load Data with Hugging Face

If you've already loaded data with Ollama, you need to regenerate embeddings:

```bash
# Set environment variable
export EMBEDDING_PROVIDER=huggingface
export HUGGINGFACE_API_KEY=hf_your_token_here

# Clear existing embeddings
psql $DB_CONNECTION_STRING -c "TRUNCATE document_chunks CASCADE;"

# Reload with Hugging Face embeddings
npx tsx scripts/load-documents.ts
```

**Note:** Hugging Face uses 384 dimensions (all-MiniLM-L6-v2) vs Ollama's 768 dimensions (nomic-embed-text), so you must regenerate embeddings when switching providers.

## Step 5: Test

```bash
# Start dev server
npm run dev

# Test a query
# The console should show: "Using Hugging Face (all-MiniLM-L6-v2) for embeddings"
```

## Rate Limits

**Free Tier:**
- ~1,000 requests/hour
- ~30,000 requests/month
- More than enough for testing and small production deployments

**If you exceed limits:**
- Wait 1 hour for rate limit reset
- Or upgrade to PRO ($9/month) for 10x higher limits

## Troubleshooting

### "Model is currently loading"

First time using a model, HF needs to load it. Wait 20-30 seconds and retry.

Add to your request:
```typescript
options: { wait_for_model: true }
```
(Already implemented in embedding-service.ts)

### "Invalid API token"

- Check token starts with `hf_`
- Regenerate token if needed
- Make sure token has "Read" permission

### "Rate limit exceeded"

- Wait 1 hour
- Or reduce request frequency
- Or upgrade to PRO tier

## Migration Path

**Start:** Free Hugging Face (sufficient for most use cases)
↓
**Growth:** Hugging Face PRO ($9/month) - 10x higher limits
↓
**Scale:** Self-hosted Ollama on VPS ($12-20/month) - unlimited
↓
**Enterprise:** OpenAI embeddings ($0.02/1M tokens) - highest quality

## Security

- ✅ Never commit tokens to git
- ✅ Rotate tokens every 6 months
- ✅ Use separate tokens for dev/prod
- ✅ Revoke unused tokens

---

**You're now ready to deploy CoverCheck for FREE!** 🚀

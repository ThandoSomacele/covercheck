# 🚀 Free Deployment Guide - CoverCheck

Deploy CoverCheck to production **completely FREE** using Hugging Face embeddings!

## 💰 Cost Breakdown

### Current Setup (FREE)
- ✅ **Vercel** - FREE (Hobby tier)
- ✅ **Railway PostgreSQL** - $5/month (or FREE tier with limitations)
- ✅ **Hugging Face Embeddings** - FREE (generous rate limits)
- ✅ **OpenRouter LLM** - FREE tier (with rate limits)

**Total: $0-5/month** (just the database!)

## 🎯 Quick Start (5 Steps)

### Step 1: Get Hugging Face API Key (2 minutes)

1. Visit https://huggingface.co/join and create account
2. Go to https://huggingface.co/settings/tokens
3. Click "New token" → Name it "covercheck" → Role: "Read"
4. Copy token (starts with `hf_`)

✅ **No credit card required!**

### Step 2: Set Up Database (5 minutes)

**Option A: Railway (Recommended)**
1. Go to https://railway.app and sign up
2. Create new project → Add PostgreSQL
3. In database settings, run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Copy connection string

**Option B: Supabase**
1. Go to https://supabase.com and sign up
2. Create new project
3. Go to SQL Editor → Run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Copy connection string from Settings → Database

### Step 3: Load Data Locally (10 minutes)

```bash
# Clone and install
git clone https://github.com/yourusername/covercheck.git
cd covercheck
npm install

# Configure environment
cp .env.example .env

# Edit .env with your keys:
DB_CONNECTION_STRING=your_railway_or_supabase_connection_string
OPENROUTER_API_KEY=your_openrouter_key
EMBEDDING_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_your_token_here

# Setup database schema
psql $DB_CONNECTION_STRING -f scripts/db-setup.sql

# Load documents (this will use Hugging Face for embeddings)
npx tsx scripts/load-documents.ts

# Verify data loaded
npx tsx scripts/check-db-stats.ts
```

### Step 4: Deploy to Vercel (3 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Set environment variables
vercel env add DB_CONNECTION_STRING
vercel env add OPENROUTER_API_KEY  
vercel env add EMBEDDING_PROVIDER
vercel env add HUGGINGFACE_API_KEY

# Deploy!
vercel --prod
```

### Step 5: Test Your Deployment

Visit your Vercel URL and test:
1. Ask: "What chronic conditions are covered by Discovery?"
2. Check citations appear
3. Try provider filter
4. Test on mobile

✅ **You're live!**

## 📊 Rate Limits & Scaling

### Free Tier Limits

**Hugging Face:**
- ~1,000 requests/hour
- ~30,000 requests/month
- Perfect for testing & small deployments

**OpenRouter:**
- Varies by model
- Gemini 2.0 Flash: Generous free tier
- Auto-fallback to other free models

**Vercel:**
- 100GB bandwidth/month
- Unlimited requests (Hobby tier)

### When You Outgrow Free Tier

**Option 1: Upgrade Hugging Face ($9/month)**
- 10x higher rate limits
- Still very affordable

**Option 2: Switch to OpenAI Embeddings (~$2-10/month)**
```env
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=sk-your_key_here
```

**Option 3: Self-host Ollama ($12-20/month)**
- Deploy Ollama on DigitalOcean/Hetzner VPS
- Unlimited embeddings
- Set `OLLAMA_HOST` to your VPS URL

## 🔧 Troubleshooting

### "Model is currently loading" (Hugging Face)

First request takes 20-30 seconds. Wait and retry. This is normal for first-time model loading.

### "Rate limit exceeded"

**Temporary solution:** Wait 1 hour
**Permanent solution:** Upgrade to Hugging Face PRO ($9/month)

### Embeddings dimension mismatch

If you previously loaded data with Ollama (768 dims) and now use Hugging Face (384 dims):

```bash
# Clear old embeddings
psql $DB_CONNECTION_STRING -c "TRUNCATE document_chunks CASCADE;"

# Reload with Hugging Face
EMBEDDING_PROVIDER=huggingface npx tsx scripts/load-documents.ts
```

### Slow response times

- Check Railway/Supabase database location (choose nearest region)
- Optimize database: `psql $DB_CONNECTION_STRING -f scripts/optimize-db.sql`
- Consider upgrading database plan if needed

## 📈 Migration Path

```
Start Here → Hugging Face FREE
    ↓ (when you get 1000+ queries/day)
Hugging Face PRO ($9/month)
    ↓ (when you get 10K+ queries/day)
Self-hosted Ollama ($12-20/month VPS)
    ↓ (enterprise scale)
OpenAI Embeddings (pay-per-use, unlimited)
```

## 🎓 Learn More

- **Hugging Face Setup:** `docs/HUGGINGFACE_SETUP.md`
- **Full Deployment Guide:** `DEPLOYMENT.md`
- **Architecture Details:** `CLAUDE.md`

## 💬 Need Help?

- Check logs in Vercel dashboard
- Review Railway/Supabase database logs
- See browser console for frontend errors
- Read `DEPLOYMENT.md` for detailed troubleshooting

---

**🎉 Congratulations! You've deployed CoverCheck for FREE!**

No credit card, no monthly fees (except optional $5/month database), and you're helping South Africans understand their medical aid options.

**Next steps:**
1. Share with friends/family for testing
2. Collect feedback
3. Monitor usage
4. Scale when ready!

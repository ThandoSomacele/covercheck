# 🇿🇦 South African Medical Aid Assistant - Quick Start

Get your **simplified, jargon-free** medical aid assistant running in minutes!

## What This Does

Helps South Africans understand their medical aid in plain English:
- ✅ **Simple answers first** - no confusing jargon
- ✅ **Rand amounts** - real costs you'll actually pay
- ✅ **SA terminology** - Medical Aid, GP, Casualty (not American terms)
- ✅ **Local context** - Netcare, Discovery, PMBs, gap cover, etc.
- ✅ **100% private** - runs on your machine, R0 cost

## Quick Start (15 minutes)

### 1. Install Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows: Download from ollama.com
```

### 2. Pull AI Model

```bash
# Start Ollama service
ollama serve

# In another terminal, pull model
ollama pull llama3.2  # 2GB, good quality
# OR
ollama pull llama3.1  # 4.7GB, better quality
```

### 3. Install & Run

```bash
# Install dependencies
npm install

# Build project
npm run build

# Run the simplified South African version
npm run sa

# OR see a demo
npm run demo:sa
```

## Example Questions to Try

Ask naturally, like you're texting a friend:

```
"If I break my arm, what will I actually pay?"

"What's the difference between Plan A and Plan B?"

"Do I need gap cover?"

"What does 'co-payment' mean?"

"Can I see any doctor or must I use network doctors?"

"Why is my medical aid rejecting my claims?"

"What are PMBs and why do they matter?"

"How do I know if I need comprehensive or hospital plan?"
```

## What Makes This Special

### Before (Confusing):
> "Your plan includes a R450 co-payment for admissions with 200% of medical aid rate for specialists, subject to savings account depletion and subsequent threshold application for ATB..."

❌ User: "I have no idea what that means!"

### After (Clear):
> **💡 SIMPLE ANSWER:**
> If you break your arm and need hospital:
> 1. You pay R450 when checking in (like an entrance fee)
> 2. Everything else is covered at a network hospital
> 3. If your specialist charges more than medical aid pays, gap cover helps
>
> **💰 WHAT THIS COSTS YOU:**
> - Hospital admission co-payment: R450
> - X-rays & treatment: R0 (covered)
> - If specialist charges R2,000 but medical aid pays R1,400: You pay R600 (or gap cover pays it)
>
> Total: Around R450-R1,050 depending on your gap cover

✅ User: "Ah, that makes sense!"

## Commands

```bash
# Main South African version (simplified answers)
npm run sa

# See a demo with example question
npm run demo:sa

# View jargon dictionary
# (In the app, type 'glossary')

# Try different AI models
# (In the app, type 'models', then 'switch mistral')

# Exit
# (Type 'exit')
```

## Key Features

### 1. Simple Language First
- No jargon in main answer
- Analogies and examples
- "Like your Netflix subscription..."

### 2. South African Context
- Medical Aid (not just "insurance")
- Rands (R) not Dollars ($)
- British/SA English (hospitalisation, not hospitalization)
- Local terminology (PMBs, gap cover, network hospitals)

### 3. Real Costs
- Shows actual Rand amounts
- Explains when you pay
- Compares plans with numbers

### 4. Jargon Dictionary
- 25+ medical aid terms explained
- Simple definitions
- Real-world analogies
- Type 'glossary' to see all terms

## What It Covers

### Medical Aid Plans
- ✅ Comprehensive vs. Hospital Plans
- ✅ Network vs. Non-network options
- ✅ Savings accounts explained
- ✅ Above Threshold Benefits (ATB)
- ✅ Co-payments and gap cover

### Common Scenarios
- ✅ "I need to go to hospital - what will I pay?"
- ✅ "Should I get gap cover?"
- ✅ "What are PMBs?"
- ✅ "Why did my claim get rejected?"
- ✅ "Can I see any doctor?"

### Terms Explained
- Co-payment / Co-pay
- Medical aid rate vs. what doctors charge
- Savings account
- Threshold / ATB
- PMBs (Prescribed Minimum Benefits)
- Network vs. Non-network
- Gap cover
- And 20+ more

## Troubleshooting

### "Cannot connect to Ollama"
```bash
# Start Ollama in separate terminal
ollama serve
```

### "Model not found"
```bash
# Pull a model first
ollama pull llama3.2
```

### Slow responses
```bash
# Use smaller, faster model
ollama pull phi3  # Only 2.3GB

# Then switch in the app
switch phi3
```

## Comparison: Options

| Aspect | This (Ollama Local) | MCP + Claude |
|--------|---------------------|--------------|
| **Cost** | R0 | ~R8,000/month |
| **Privacy** | 100% local | Cloud-based |
| **Quality** | Good | Excellent |
| **Speed** | 5-10 seconds | 2 seconds |
| **Setup** | 15 minutes | 5 minutes |
| **Internet** | Not needed | Required |
| **Best for** | Development, MVP, privacy | Production |

## Files Explained

### Core Files (You need these)
- `documents-sa.ts` - SA medical aid plans (Rands, SA terms)
- `insurance-glossary-sa.ts` - Jargon dictionary (25+ terms)
- `ollama-simplified.ts` - Main app with simplified answers
- `sa-medical-aid.ts` - **NEW: South African version you run**

### Documentation
- `SETUP_SA.md` - This file
- `CLAUDE.md` - Full technical documentation
- `README.md` - Original project overview

### Optional/Examples
- `production-example.ts` - How to scale with vector DB
- `web-interface-example.ts` - How to build web UI

## Next Steps

### For Development
1. ✅ Test with the demo (`npm run demo:sa`)
2. Add your own medical aid plan documents
3. Test with real questions from users
4. Iterate based on feedback

### For Production
1. Use Ollama for development (R0 cost)
2. Test thoroughly with real users
3. When ready, deploy with Claude for better quality
4. Keep Ollama version for staging/testing

## Cost Analysis

**Development (This Setup):**
- Hardware: R0 (use existing computer)
- AI queries: R0 (unlimited local)
- **Total: R0/month**

**Production (When Ready):**
- Claude API: ~R8,000/month (for 5,000 queries/day)
- Infrastructure: ~R3,000/month
- **Total: ~R11,000/month**

**Hybrid Approach (Recommended):**
- Develop with Ollama: R0
- Deploy with Claude: R11,000/month
- Keep Ollama for testing: R0
- **Best value!**

## Support

**Ollama Issues:**
- https://github.com/ollama/ollama
- Run `ollama --help`

**Project Issues:**
- Check build: `npm run build`
- Verify Node version: `node --version` (need 18+)

## Success Checklist

- [ ] Ollama installed and running
- [ ] Model pulled (llama3.2 or llama3.1)
- [ ] `npm install` completed
- [ ] `npm run build` successful
- [ ] `npm run demo:sa` works
- [ ] Can ask questions and get clear answers
- [ ] Answers are in South African context (Rands, SA terms)
- [ ] Response time acceptable (<30 seconds)

**All checked? You're ready! 🎉**

## What Users Love

1. **"Finally makes sense!"** - No more confusing jargon
2. **"Shows me what I'll pay"** - Real Rand amounts
3. **"Local context"** - Uses SA medical aid terms
4. **"Private"** - Runs on my machine, data stays local
5. **"Free!"** - R0 cost for development

---

**⏱️ Setup time: 15 minutes**
**💵 Cost: R0**
**🇿🇦 Language: South African English**
**🔒 Privacy: 100% local**

**Run now:** `npm run sa`

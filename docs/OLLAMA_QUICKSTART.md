# Ollama Integration - Quick Start Guide

Get your insurance RAG system running with Ollama in the next hour!

## Prerequisites Check

Before starting, verify:

```bash
# 1. Check if Ollama is installed
ollama --version

# 2. Check if Ollama service is running
ollama list
```

If not installed, continue with setup below.

## Setup (15 minutes)

### Step 1: Install Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from https://ollama.com/download

### Step 2: Start Ollama Service

```bash
ollama serve
```

Keep this terminal open. In a new terminal, continue:

### Step 3: Pull a Model

Choose ONE of these models (recommendation: llama3.1):

```bash
# Best quality (4.7GB) - RECOMMENDED
ollama pull llama3.1

# Alternative: Smaller, faster (4.1GB)
ollama pull mistral

# Alternative: Lightweight (2.3GB)
ollama pull phi3
```

### Step 4: Verify Setup

```bash
# Test that Ollama works
ollama run llama3.1 "Hello!"

# Press Ctrl+D to exit
```

## Running the Insurance Assistant

### Option 1: Interactive CLI (Recommended for Testing)

```bash
npm run ollama
```

This starts an interactive session where you can:
- Ask questions about insurance
- See which documents are searched
- Watch Ollama generate answers in real-time

### Option 2: Programmatic Use

```typescript
import { askInsurance } from './build/ollama-simple.js';

const answer = await askInsurance("What does Health Plan A cover?");
console.log(answer);
```

## Example Test Queries

Try these questions to test the system:

```
❓ What does Health Plan A cover?
❓ Compare Health Plan A and Health Plan B
❓ How do I file a dental claim?
❓ What's the deductible for the cheapest plan?
❓ What's covered for emergency room visits?
```

## Expected Output

```
╔════════════════════════════════════════════════════════════╗
║  Insurance Documentation Assistant (Ollama Edition)        ║
║  Direct RAG integration - No MCP required                  ║
╚════════════════════════════════════════════════════════════╝

📚 Loaded: 5 documents, 3 products
🤖 Using: Ollama (local)
💰 Cost: $0 (runs on your machine)

❓ Your question: What does Health Plan A cover?

🔍 Searching documents...
✅ Found 2 relevant document(s)
   - Health Insurance Plan A - Coverage Details
   - Health Insurance Plan B - Coverage Details

🤖 Asking llama3.1...

💬 Answer:
Based on the Health Insurance Plan A - Coverage Details, this plan provides:

1. Inpatient hospitalisation: 100% coverage after R9,000 deductible
2. Outpatient services: 80% coverage after R1,800 co-payment
3. Prescription drugs: Tiered coverage (R180/R540/R1,080)
4. Preventive care: 100% coverage with no deductible
5. Emergency room: R4,500 co-payment, then 100% coverage
...
```

## Commands Available in Interactive Mode

- **Type your question** - Get an answer
- **`models`** - List all available Ollama models
- **`switch <model>`** - Change to a different model (e.g., `switch mistral`)
- **`exit`** - Quit the program

## Switching Models

To try different models:

```bash
# In the interactive CLI
❓ Your question: switch mistral
✅ Switched to model: mistral

# Or pull and switch to phi3
ollama pull phi3
❓ Your question: switch phi3
```

## Performance Comparison

| Model | Size | Speed | Quality | RAM Needed |
|-------|------|-------|---------|------------|
| **llama3.1** | 4.7GB | Medium | Excellent | 8GB |
| **mistral** | 4.1GB | Fast | Very Good | 8GB |
| **phi3** | 2.3GB | Very Fast | Good | 4GB |

## Troubleshooting

### "Cannot connect to Ollama"

```bash
# Start Ollama in a separate terminal
ollama serve
```

### "Model not found"

```bash
# Pull the model first
ollama pull llama3.1
```

### Slow responses

- Use a smaller model: `ollama pull phi3`
- Close other applications to free RAM
- Ensure Ollama is using GPU (check with `ollama ps`)

### Out of memory

```bash
# Use a smaller model
ollama pull phi3

# Or reduce context size in the code
# (Edit ollama-simple.ts, reduce limit in searchDocuments)
```

## What's Happening Under the Hood?

```
1. User asks: "What does Health Plan A cover?"
                ↓
2. Search function finds relevant documents
   (Simple keyword matching)
                ↓
3. Build context with document content
                ↓
4. Send to Ollama with prompt:
   "Answer based ONLY on these documents..."
                ↓
5. Ollama generates answer
   (Runs on your machine, $0 cost)
                ↓
6. Display answer to user
```

## Comparing to MCP/Claude Approach

| Aspect | MCP + Claude | Direct + Ollama |
|--------|--------------|-----------------|
| **Cost** | ~R9,000/mo (5K queries) | R0 |
| **Setup** | 5 min | 15 min |
| **Quality** | Excellent | Good |
| **Speed** | ~2 sec | ~5-10 sec |
| **Privacy** | Cloud | 100% Local |
| **Internet** | Required | Not required |
| **Best for** | Production | Development/MVP |

## Next Steps

### For Development:
1. ✅ Use Ollama for testing (this guide)
2. Add more documents to `ollama-simple.ts` (line ~40)
3. Test different queries
4. Iterate on prompt engineering

### For Production:
1. Test with Ollama locally
2. Once satisfied, switch to Claude for better quality
3. Deploy with MCP server for standardized architecture
4. Add authentication, monitoring, etc.

## Cost Analysis

**Development with Ollama:**
- Hardware: R0 (use existing computer)
- Queries: R0 (unlimited local)
- Total: **R0/month**

**Production with Claude:**
- API: ~R9,000/month (5,000 queries/day)
- Infrastructure: ~R3,600/month
- Total: **~R12,600/month**

**Hybrid Approach (Recommended):**
- Develop with Ollama: R0
- Deploy to production with Claude: R12,600/month
- Use Ollama for staging/testing: R0
- **Best of both worlds!**

## Tips for Better Results

1. **Be specific in questions**: "What's the deductible for Plan A?" vs "Tell me about plans"

2. **Iterate on prompts**: Edit the prompt in `ollama-simple.ts` (line ~235) to get better answers

3. **Add more documents**: More context = better answers

4. **Try different models**: Each model has different strengths
   - llama3.1: Best for complex questions
   - mistral: Good balance
   - phi3: Fast, simple questions

5. **Monitor document search**: The CLI shows which docs are found - verify they're relevant

## Success Checklist

- [ ] Ollama installed and running
- [ ] Model pulled (llama3.1 or alternative)
- [ ] `npm run ollama` works
- [ ] Can ask questions and get answers
- [ ] Answers cite specific insurance details
- [ ] Response time acceptable (<30 seconds)

If all checked, you're ready! 🚀

## Support

**Issues with Ollama:**
- https://github.com/ollama/ollama/issues
- Run `ollama --help`

**Issues with this integration:**
- Check build output: `npm run build`
- Verify TypeScript: `npx tsc --noEmit`
- Check Node version: `node --version` (needs 18+)

---

**Time to first answer: ~20 minutes**
**Cost: $0**
**Privacy: 100% local**

Happy testing! 🎉

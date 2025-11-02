# 🇿🇦 Insurance Assistant

**Your medical aid and insurance questions answered simply.**

A modern AI-powered insurance assistant with both a web chat interface and CLI tools. Built with SvelteKit, TypeScript, and Ollama for 100% private, R0-cost AI responses.

## ✨ Features

- 🌐 **Modern Web Chat Interface** - ChatGPT-style UI for conversational queries
- 💻 **CLI Tools** - Fast command-line interface for power users (in `legacy/`)
- 🇿🇦 **South African Context** - Uses Rands (R), SA English, and medical aid terminology
- 🔒 **100% Private** - Runs locally with Ollama, no data leaves your machine
- 💰 **R0 Cost** - No API fees, unlimited queries
- 📚 **Source Citations** - Every answer shows which documents were used
- ⚡ **Fast & Direct** - Concise answers without jargon

## 🚀 Quick Start

### Prerequisites

1. **Install Ollama:**
   ```bash
   # macOS
   brew install ollama

   # Linux
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. **Start Ollama and pull a model:**
   ```bash
   ollama serve  # In one terminal
   ollama pull llama3.2  # In another terminal
   ```

### Installation

```bash
# Install dependencies
npm install

# Start the web chat interface
npm run dev
```

Open your browser to `http://localhost:5173` and start chatting!

## 📁 Project Structure

```
insurance-mcp/
├── src/
│   ├── lib/
│   │   ├── insurance/              # Insurance data and glossaries
│   │   │   ├── documents-sa.ts     # SA medical aid documents
│   │   │   ├── insurance-glossary-sa.ts
│   │   │   └── insurance-jargon-glossary.ts
│   │   └── server/
│   │       └── rag.ts              # RAG logic (search + Ollama)
│   └── routes/
│       ├── +page.svelte            # Chat UI
│       └── api/
│           └── chat/
│               └── +server.ts       # API endpoint
├── docs/                            # Complete documentation
├── legacy/                          # Old CLI/MCP implementations
├── static/                          # Static assets
├── package.json
└── README.md                        # This file
```

## 🎯 Usage

### Web Chat Interface (Recommended)

```bash
npm run dev
```

Visit `http://localhost:5173` and chat naturally:
- "If I break my arm, what will I pay?"
- "What's the difference between Plan A and Plan B?"
- "How do I file a claim?"

### Features:
- Conversational interface
- Message history
- Source citations
- Loading indicators
- Responsive design

## 🛠️ Development

### Adding Insurance Documents

Edit `src/lib/insurance/documents-sa.ts` to add more plans or update existing ones.

### Changing the AI Model

Edit `src/lib/server/rag.ts`:

```typescript
const response = await ollama.chat({
  model: 'llama3.2',  // Change this
  // ...
});
```

### Customizing Prompts

Edit the simplification prompts in:
- `src/lib/insurance/insurance-glossary-sa.ts` (SA-specific)
- `src/lib/insurance/insurance-jargon-glossary.ts` (generic)

## 📚 Documentation

Complete documentation is available in the `docs/` directory:

- **`docs/PROJECT_STRUCTURE.md`** - Detailed project structure and architecture
- **`docs/SETUP_SA.md`** - Quick start guide for South African users
- **`docs/SUMMARY.md`** - Complete project overview
- **`docs/CLAUDE.md`** - Technical implementation details
- **`docs/ARCHITECTURE_DIAGRAMS.md`** - System architecture diagrams
- **`docs/OLLAMA_QUICKSTART.md`** - Ollama setup and configuration

## 🏗️ Building for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

## 🧪 Technology Stack

- **SvelteKit** - Full-stack framework
- **TypeScript** - Type safety
- **Svelte 5** - Reactive UI with runes
- **Ollama** - Local AI model runner
- **RAG Pattern** - Retrieval-augmented generation

## 📦 Legacy Implementations

The `legacy/` directory contains previous CLI and MCP server implementations:

- **MCP Server** (`server.ts`) - For Claude Desktop integration
- **CLI Tools** - Command-line versions (`ollama-simple.ts`, `sa-medical-aid.ts`)
- **Test Scripts** - Testing utilities

See `legacy/README.md` for details on using these implementations.

## 🔧 Troubleshooting

### "Cannot connect to Ollama"
Make sure Ollama is running: `ollama serve`

### "Model not found"
Pull the model: `ollama pull llama3.2`

### Port already in use
Change the port: `npm run dev -- --port 3000`

## 🎨 Customization

All styling is in `src/routes/+page.svelte`. The design features:
- Modern purple gradient header
- Clean message bubbles
- Smooth animations
- Fully responsive layout

## 📝 License

See LICENSE file for details.

## 🙏 Acknowledgments

Built with:
- [SvelteKit](https://kit.svelte.dev/)
- [Ollama](https://ollama.ai/)
- [Svelte 5](https://svelte.dev/)

---

**Made with ❤️ for South Africans who want simple, clear answers about their medical aid.**

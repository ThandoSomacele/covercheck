# Project Structure Documentation

## Overview

The Insurance Assistant has been restructured as a **unified SvelteKit application** with proper separation of concerns, clean module organization, and comprehensive documentation.

## Directory Structure

```
insurance-mcp/                            # Project root (SvelteKit application)
├── src/
│   ├── lib/
│   │   ├── insurance/                    # Insurance data and logic
│   │   │   ├── documents-sa.ts           # SA medical aid plans and documents
│   │   │   ├── insurance-glossary-sa.ts  # SA-specific prompts and glossary
│   │   │   └── insurance-jargon-glossary.ts # Generic insurance glossary
│   │   └── server/                       # Server-only code
│   │       └── rag.ts                    # RAG logic (search + Ollama)
│   ├── routes/
│   │   ├── +page.svelte                  # Chat interface (UI)
│   │   ├── +layout.svelte                # Root layout
│   │   └── api/
│   │       └── chat/
│   │           └── +server.ts            # Chat API endpoint
│   ├── app.d.ts                          # TypeScript declarations
│   └── app.html                          # HTML template
│
├── docs/                                 # Documentation
│   ├── ARCHITECTURE_DIAGRAMS.md          # System architecture
│   ├── CHEAT_SHEET.md                    # Quick reference
│   ├── CLAUDE.md                         # Technical details
│   ├── DECISION_GUIDE.md                 # Decision trees
│   ├── OLLAMA_QUICKSTART.md              # Ollama setup
│   ├── PROJECT_OVERVIEW.md               # High-level overview
│   ├── PROJECT_STRUCTURE.md              # This file
│   ├── SETUP_SA.md                       # SA-specific setup
│   └── SUMMARY.md                        # Project summary
│
├── legacy/                               # Legacy implementations
│   ├── documents-sa.ts                   # (old location)
│   ├── insurance-glossary-sa.ts          # (old location)
│   ├── insurance-jargon-glossary.ts      # (old location)
│   ├── server.ts                         # MCP server
│   ├── ollama-simple.ts                  # Simple CLI
│   ├── ollama-simplified.ts              # Simplified CLI
│   ├── sa-medical-aid.ts                 # SA CLI
│   ├── test-ollama.ts                    # Test script
│   ├── test-simplified.ts                # Demo script
│   └── README.md                         # Legacy documentation
│
├── static/                               # Static assets (images, fonts, etc.)
├── .svelte-kit/                          # SvelteKit build output (gitignored)
├── build/                                # Production build (gitignored)
├── node_modules/                         # Dependencies (gitignored)
│
├── package.json                          # Dependencies and scripts
├── package-lock.json                     # Lock file
├── svelte.config.js                      # SvelteKit configuration
├── tsconfig.json                         # TypeScript configuration
├── vite.config.ts                        # Vite configuration
└── README.md                             # Main setup guide
```

## Key Directories Explained

### `/src/lib/`

This is where **shared code** lives that can be imported by both client and server.

- **`insurance/`** - Data and utilities that can be used anywhere
  - Contains insurance documents, glossaries, and helper functions
  - Can be imported in both client components and server endpoints
  - Uses `$lib` imports for clean module resolution

- **`server/`** - Server-only code (NEVER sent to client)
  - Contains RAG logic that uses Ollama
  - Only accessible in `+server.ts` files and `+page.server.ts` files
  - Prevents sensitive logic from being exposed to the client

### `/chat-ui/src/routes/`

SvelteKit's **file-based routing** system.

- **`+page.svelte`** - Main chat interface (client-side component)
- **`+layout.svelte`** - Root layout wrapper (optional)
- **`api/chat/+server.ts`** - API endpoint for chat messages
  - Responds to POST requests at `/api/chat`
  - Imports from `$lib/server/rag` to process queries
  - Returns JSON responses with answers and sources

### `/chat-ui/docs/`

Comprehensive project documentation:

- **Setup guides** - How to install and run
- **Architecture docs** - How the system works
- **Reference materials** - Quick references and decisions

## Import Patterns

### Client-Side Components (`+page.svelte`)

```typescript
// Can import from $lib/insurance (shared data)
import { documentsDB_SA } from '$lib/insurance/documents-sa';

// CANNOT import from $lib/server (would error)
// import { queryInsurance } from '$lib/server/rag'; // ❌ Error!

// Instead, use API endpoints
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message: 'question' })
});
```

### Server-Side Endpoints (`+server.ts`)

```typescript
// Can import from $lib/insurance (shared data)
import { documentsDB_SA } from '$lib/insurance/documents-sa';

// Can import from $lib/server (server-only code)
import { queryInsurance } from '$lib/server/rag';

export const POST: RequestHandler = async ({ request }) => {
  const { message } = await request.json();
  const result = await queryInsurance(message);
  return json(result);
};
```

## File Responsibilities

### `src/lib/insurance/documents-sa.ts`

**Purpose:** Contains South African medical aid documents and plans

**Exports:**
- `documentsDB_SA: Document[]` - Array of insurance documents
- `Document` type definition

**Used by:**
- `src/lib/server/rag.ts` - For document search
- Can be used by client components for UI elements

**Example:**
```typescript
export const documentsDB_SA: Document[] = [
  {
    id: 'doc-001',
    title: 'Health Plan A - Summary',
    content: 'Comprehensive coverage with R450 co-payment...',
    category: 'medical_aid'
  },
  // ... more documents
];
```

### `src/lib/insurance/insurance-glossary-sa.ts`

**Purpose:** SA-specific prompts and glossary terms

**Exports:**
- `getSimplificationPromptSA()` - Returns SA-localized prompt for Ollama
- `glossaryTermsSA` - Dictionary of SA medical aid terms

**Used by:**
- `src/lib/server/rag.ts` - For generating prompts

**Key Features:**
- Uses SA terminology (medical aid, GP, casualty)
- Formats costs in Rands (R)
- British/SA English spelling

### `src/lib/server/rag.ts`

**Purpose:** RAG (Retrieval-Augmented Generation) logic

**Exports:**
- `searchDocuments(query, limit)` - Searches documents by keywords
- `queryInsurance(question, model)` - Full RAG pipeline

**Used by:**
- `src/routes/api/chat/+server.ts` - API endpoint

**Flow:**
1. Search documents for relevant content
2. Build context from found documents
3. Create prompt with SA-specific instructions
4. Send to Ollama for response
5. Return answer with source citations

### `src/routes/api/chat/+server.ts`

**Purpose:** API endpoint for chat messages

**Exports:**
- `POST` handler - Processes chat requests

**Request:**
```json
{ "message": "If I break my arm, what will I pay?" }
```

**Response:**
```json
{
  "response": "If you break your arm...",
  "sources": ["Health Plan A - Summary", "Co-payments Guide"]
}
```

### `src/routes/+page.svelte`

**Purpose:** Main chat interface

**Features:**
- Message history with user/assistant messages
- Input box with send button
- Loading indicators
- Source citation display
- Responsive design

**State Management:**
- Uses Svelte 5 runes (`$state`, `$derived`)
- Reactive message updates
- Automatic scrolling

## Data Flow

### User asks a question

```
User types in +page.svelte
    ↓
sends POST to /api/chat
    ↓
+server.ts receives request
    ↓
calls queryInsurance() from rag.ts
    ↓
rag.ts searches documents
    ↓
rag.ts builds prompt
    ↓
rag.ts sends to Ollama
    ↓
Ollama generates response
    ↓
rag.ts returns { response, sources }
    ↓
+server.ts sends JSON back
    ↓
+page.svelte displays message
```

## Configuration Files

### `package.json`

```json
{
  "name": "insurance-assistant",
  "scripts": {
    "dev": "vite dev",           // Development server
    "build": "vite build",       // Production build
    "preview": "vite preview"    // Preview production build
  }
}
```

### `svelte.config.js`

SvelteKit configuration:
- Adapter settings (auto-detect platform)
- Preprocessing options
- Alias configuration (`$lib`)

### `tsconfig.json`

TypeScript configuration:
- `"moduleResolution": "bundler"` - Modern module resolution
- `"target": "ES2020"` - Modern JavaScript features
- Path aliases for `$lib`

### `vite.config.ts`

Vite bundler configuration:
- SvelteKit plugin
- Build optimization
- Dev server settings

## Design Patterns

### 1. Separation of Concerns

- **Client** (`+page.svelte`) - UI and user interaction
- **API** (`+server.ts`) - Request handling and validation
- **Logic** (`rag.ts`) - Business logic and AI integration
- **Data** (`insurance/`) - Data and configuration

### 2. Single Source of Truth

- Insurance documents defined once in `documents-sa.ts`
- Prompts defined once in `insurance-glossary-sa.ts`
- RAG logic centralized in `rag.ts`

### 3. Type Safety

- TypeScript throughout the project
- Type definitions for documents, messages, API responses
- Compile-time error checking

### 4. Module Resolution

- `$lib` imports for clean module paths
- No relative imports like `../../lib/`
- Clear separation of client/server code

## Development Workflow

### 1. Adding New Insurance Documents

```typescript
// Edit: src/lib/insurance/documents-sa.ts
export const documentsDB_SA: Document[] = [
  // ... existing documents
  {
    id: 'doc-new',
    title: 'New Plan',
    content: 'Plan details...',
    category: 'medical_aid'
  }
];
```

### 2. Modifying Prompts

```typescript
// Edit: src/lib/insurance/insurance-glossary-sa.ts
export function getSimplificationPromptSA(): string {
  return `
    You are a medical aid assistant...
    // Customize instructions here
  `;
}
```

### 3. Updating RAG Logic

```typescript
// Edit: src/lib/server/rag.ts
export async function queryInsurance(question: string, model: string = 'llama3.2') {
  // Modify search algorithm
  // Change prompt construction
  // Adjust response formatting
}
```

### 4. UI Changes

```svelte
<!-- Edit: src/routes/+page.svelte -->
<style>
  /* Update styling */
</style>

<script lang="ts">
  // Modify component logic
</script>

<!-- Update markup -->
```

## Build Process

### Development

```bash
npm run dev
```

- Starts Vite dev server
- Hot module replacement (HMR)
- TypeScript checking
- Instant updates

### Production

```bash
npm run build
```

- Compiles TypeScript
- Bundles assets
- Optimizes code
- Generates `.svelte-kit/output/`

### Preview

```bash
npm run preview
```

- Tests production build locally
- Simulates deployment environment

## Migration Summary

### What Was Moved

| Old Location | New Location | Reason |
|-------------|-------------|---------|
| `/documents-sa.ts` | `/src/lib/insurance/documents-sa.ts` | Proper module organization |
| `/insurance-glossary-sa.ts` | `/src/lib/insurance/insurance-glossary-sa.ts` | Logical grouping |
| `/insurance-jargon-glossary.ts` | `/src/lib/insurance/insurance-jargon-glossary.ts` | Logical grouping |
| RAG logic in API endpoint | `/src/lib/server/rag.ts` | Reusability |
| Various `.md` files | `/docs/` | Centralized documentation |
| Old `.ts` CLI files | `/legacy/` | Archive for reference |

### What Was Changed

1. **Package structure** - One `package.json` instead of two
2. **Imports** - `$lib` imports instead of relative paths
3. **API endpoint** - Simplified to delegate to `rag.ts`
4. **Documentation** - Consolidated in `/docs/`
5. **Build** - Single build process for entire app

### What Stayed the Same

1. **Insurance data** - Same documents and glossaries
2. **RAG algorithm** - Same search and prompt logic
3. **Ollama integration** - Same model and API usage
4. **SA localization** - Same prompts and terminology

## Next Steps

### For Development

1. Add more insurance documents to `documents-sa.ts`
2. Customize prompts in `insurance-glossary-sa.ts`
3. Enhance UI in `+page.svelte`
4. Add features (authentication, user profiles, etc.)

### For Deployment

1. Choose adapter (Vercel, Netlify, Node, etc.)
2. Configure environment variables
3. Set up Ollama on server
4. Deploy SvelteKit app

### For Scaling

1. Replace in-memory search with vector database
2. Add caching layer
3. Implement rate limiting
4. Add analytics and monitoring

## Troubleshooting

### Import Errors

**Problem:** `Cannot find module '$lib/...'`

**Solution:** Run `npm run dev` or `svelte-kit sync` to generate types

### Build Errors

**Problem:** TypeScript errors during build

**Solution:**
```bash
npm run check  # Check for errors
npm run build  # Try building again
```

### Ollama Connection

**Problem:** Cannot connect to Ollama

**Solution:**
```bash
ollama serve  # Start Ollama
curl http://localhost:11434/api/tags  # Verify it's running
```

## Resources

- **SvelteKit Docs**: https://kit.svelte.dev/docs
- **Svelte 5 Docs**: https://svelte.dev/docs
- **Ollama Docs**: https://ollama.com/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs

---

**Last Updated:** 2025-11-02

**Maintained By:** Insurance Assistant Team

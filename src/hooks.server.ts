/**
 * SvelteKit Server Hooks
 * Loads environment variables from .env file for local development
 */
import { config } from 'dotenv';

// Load .env file in development
if (process.env.NODE_ENV !== 'production') {
  config();
  console.log('🔧 Environment loaded from .env file');
  console.log(`   EMBEDDING_PROVIDER: ${process.env.EMBEDDING_PROVIDER || 'not set (defaulting to ollama)'}`);
}

// Optional: Add global error handler or request interceptors here

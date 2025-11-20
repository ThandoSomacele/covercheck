/**
 * Embedding Service - Abstraction layer for embedding generation
 * Supports multiple providers: Ollama (local), Hugging Face (free cloud), OpenAI (paid cloud)
 */

import { Ollama } from 'ollama';

export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
  getDimensions(): number;
  getName(): string;
}

/**
 * Ollama provider for local embeddings (development)
 */
class OllamaProvider implements EmbeddingProvider {
  private ollama: Ollama;
  private model = 'nomic-embed-text';
  
  constructor() {
    this.ollama = new Ollama();
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.ollama.embeddings({
      model: this.model,
      prompt: text,
    });
    return response.embedding;
  }
  
  getDimensions(): number {
    return 768;
  }
  
  getName(): string {
    return 'Ollama (nomic-embed-text)';
  }
}

/**
 * Hugging Face provider for cloud embeddings (FREE tier available)
 * Uses the Inference API with BAAI/bge-small-en-v1.5
 */
class HuggingFaceProvider implements EmbeddingProvider {
  private apiKey: string;
  // Using BAAI/bge-small-en-v1.5 - optimized for embeddings, free, 384 dims
  private model = 'BAAI/bge-small-en-v1.5';
  private apiUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Updated URL as of 2025 - new Hugging Face router endpoint
    this.apiUrl = `https://router.huggingface.co/hf-inference/pipeline/feature-extraction/${this.model}`;
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    // Use the new router endpoint (2025) with feature extraction task
    const apiUrl = `https://router.huggingface.co/hf-inference/models/${this.model}`;

    // Retry logic for handling temporary API failures
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: [text],
            options: { wait_for_model: true }
          }),
        });

        if (!response.ok) {
          const error = await response.text();

          // Retry on 502 (Bad Gateway), 503 (Service Unavailable), or 429 (Rate Limit)
          if ([502, 503, 429].includes(response.status) && attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.log(`⚠️  HF API ${response.status}, retrying in ${waitTime/1000}s (attempt ${attempt}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }

          throw new Error(`Hugging Face API error: ${response.status} - ${error.substring(0, 200)}`);
        }

        const result = await response.json();

        // Handle different response formats
        if (Array.isArray(result)) {
          return Array.isArray(result[0]) ? result[0] : result;
        }

        throw new Error('Unexpected response format from Hugging Face API');

      } catch (error) {
        // Don't retry on non-retryable errors
        const errorMsg = (error as Error).message;
        if (!errorMsg.includes('502') && !errorMsg.includes('503') && !errorMsg.includes('429')) {
          throw error;
        }

        if (attempt === maxRetries) {
          throw error;
        }
      }
    }

    throw new Error('Failed to generate embedding after retries');
  }
  
  getDimensions(): number {
    return 384; // all-MiniLM-L6-v2 dimensions
  }
  
  getName(): string {
    return 'Hugging Face (bge-small-en-v1.5)';
  }
}

/**
 * OpenAI provider for cloud embeddings (paid, when you have funds)
 */
class OpenAIProvider implements EmbeddingProvider {
  private apiKey: string;
  private model = 'text-embedding-3-small';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: this.model,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    return data.data[0].embedding;
  }
  
  getDimensions(): number {
    return 1536; // text-embedding-3-small dimensions
  }
  
  getName(): string {
    return 'OpenAI (text-embedding-3-small)';
  }
}

/**
 * Get the configured embedding provider based on environment
 */
export function getEmbeddingProvider(): EmbeddingProvider {
  const provider = process.env.EMBEDDING_PROVIDER || 'ollama';
  
  switch (provider.toLowerCase()) {
    case 'huggingface':
    case 'hf':
      const hfKey = process.env.HUGGINGFACE_API_KEY;
      if (!hfKey) {
        throw new Error('HUGGINGFACE_API_KEY environment variable is required for Hugging Face provider');
      }
      console.log('Using Hugging Face embeddings (FREE)');
      return new HuggingFaceProvider(hfKey);
      
    case 'openai':
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required for OpenAI provider');
      }
      console.log('Using OpenAI embeddings');
      return new OpenAIProvider(openaiKey);
      
    case 'ollama':
    default:
      console.log('Using Ollama embeddings (local)');
      return new OllamaProvider();
  }
}

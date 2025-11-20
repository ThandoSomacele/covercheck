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
 * Uses the Inference API with sentence-transformers/all-MiniLM-L6-v2
 */
class HuggingFaceProvider implements EmbeddingProvider {
  private apiKey: string;
  private model = 'sentence-transformers/all-MiniLM-L6-v2'; // Free, fast, 384 dims
  private apiUrl: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.apiUrl = `https://api-inference.huggingface.co/pipeline/feature-extraction/${this.model}`;
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text,
        options: { wait_for_model: true }
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} - ${error}`);
    }
    
    const embedding = await response.json();
    
    // HF returns the embedding directly or in an array
    return Array.isArray(embedding[0]) ? embedding[0] : embedding;
  }
  
  getDimensions(): number {
    return 384; // all-MiniLM-L6-v2 dimensions
  }
  
  getName(): string {
    return 'Hugging Face (all-MiniLM-L6-v2)';
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

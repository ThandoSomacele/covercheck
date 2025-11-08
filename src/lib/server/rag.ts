import { documentsDB_SA } from '$lib/insurance/documents-sa';
import { getSimplificationPromptSA } from '$lib/insurance/insurance-glossary-sa';
import { Ollama } from 'ollama';

// Initialize Ollama client
const ollama = new Ollama({ host: 'http://localhost:11434' });

// Search function
export function searchDocuments(query: string, limit: number = 3) {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/);

  const scored = documentsDB_SA.map(doc => {
    const contentLower = (doc.title + ' ' + doc.content).toLowerCase();
    const score = queryTerms.reduce((acc, term) => {
      const matches = (contentLower.match(new RegExp(term, 'g')) || []).length;
      return acc + matches;
    }, 0);

    return { doc, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.doc);
}

// Main RAG query function
export async function queryInsurance(question: string, model: string = 'llama3.1:8b') {
  // Search relevant documents
  const relevantDocs = searchDocuments(question, 3);

  if (relevantDocs.length === 0) {
    return {
      response:
        "I couldn't find information about that in our insurance documents. Can you rephrase your question or ask about a specific plan?",
      sources: [],
    };
  }

  // Build context from documents
  const context = relevantDocs.map(doc => `Document: ${doc.title}\n${doc.content}`).join('\n\n---\n\n');

  // Get the simplified prompt for SA
  const simplificationPrompt = getSimplificationPromptSA();

  // Create prompt
  const prompt = `${simplificationPrompt}

MEDICAL AID DOCUMENTS TO USE:
${context}

USER'S QUESTION: ${question}

YOUR ANSWER (Remember: Use SA English, Rands, and medical aid terminology):`;

  // Query Ollama
  const response = await ollama.chat({
    model: model,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    stream: false,
  });

  return {
    response: response.message.content,
    sources: relevantDocs.map(doc => doc.title),
  };
}

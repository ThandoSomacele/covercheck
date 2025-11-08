<script lang="ts">
  import { marked } from 'marked';

  interface Source {
    title: string;
    url: string;
    provider: string;
    relevance: number;
  }

  interface Message {
    role: 'user' | 'assistant';
    content: string;
    sources?: Source[];
  }

  let messages = $state<Message[]>([]);
  let input = $state('');
  let loading = $state(false);
  let selectedProvider = $state<string>('all');

  // Configure marked options
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  const providers = [
    { value: 'all', label: '🌐 All Providers' },
    { value: 'Discovery Health', label: '💎 Discovery Health' },
    { value: 'Bonitas Medical Fund', label: '🏥 Bonitas Medical Fund' },
    { value: 'Momentum Health', label: '⚡ Momentum Health' },
  ];

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    input = '';

    // Add user message to chat
    messages = [...messages, { role: 'user', content: userMessage }];
    loading = true;

    // Add empty assistant message that will be filled with streaming content
    const assistantMessageIndex = messages.length;
    messages = [...messages, { role: 'assistant', content: '', sources: [] }];

    // Store sources temporarily until streaming is complete
    let tempSources: Source[] = [];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          provider: selectedProvider === 'all' ? undefined : selectedProvider,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines (separated by \n)
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const chunk = JSON.parse(line);

            if (chunk.type === 'sources') {
              // Store sources but don't display yet
              tempSources = chunk.data;
            } else if (chunk.type === 'chunk') {
              // Append content chunk
              messages[assistantMessageIndex].content += chunk.data;
              messages = [...messages]; // Trigger reactivity
            } else if (chunk.type === 'done') {
              // Now show sources when streaming is complete
              messages[assistantMessageIndex].sources = tempSources;
              messages = [...messages];
            } else if (chunk.type === 'error') {
              messages[assistantMessageIndex].content = `Error: ${chunk.data}`;
              messages = [...messages];
            }
          } catch (e) {
            console.error('Failed to parse chunk:', line, e);
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      messages[assistantMessageIndex].content = 'Sorry, something went wrong. Please try again.';
      messages = [...messages];
    } finally {
      loading = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  /**
   * Convert source references like "Source 1" into clickable link icons
   * Formats markdown content and replaces source references with icon-only links
   */
  function formatMessageContent(content: string, sources: Source[]): string {
    if (!content) return content;

    // First, parse markdown
    let formatted = marked.parse(content) as string;

    // Then replace "Source X" with clickable icon-only link
    if (sources && sources.length > 0) {
      formatted = formatted.replace(/\b(source|Source)\s+(\d+)\b/gi, (match, sourceWord, num) => {
        const sourceIndex = parseInt(num) - 1;
        if (sourceIndex >= 0 && sourceIndex < sources.length) {
          const source = sources[sourceIndex];
          return `<a href="${source.url}" target="_blank" rel="noopener noreferrer" class="inline-source-link" title="Source ${num}: ${source.title} (${source.provider})" aria-label="Source ${num}">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
								<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
							</svg>
						</a>`;
        }
        return match;
      });
    }

    return formatted;
  }
</script>

<div class="chat-container">
  <header>
    <h1>🏥 CoverCheck</h1>
    <p>Find answers about South African medical aid plans with official sources</p>

    <div class="provider-selector">
      <label for="provider">Search in:</label>
      <select id="provider" bind:value={selectedProvider}>
        {#each providers as provider}
          <option value={provider.value}>{provider.label}</option>
        {/each}
      </select>
    </div>
  </header>

  <div class="messages">
    {#if messages.length === 0}
      <div class="welcome">
        <h2>👋 Welcome to CoverCheck!</h2>
        <p class="welcome-subtitle">
          Ask me anything about South African medical aid plans. I'll provide answers with official sources.
        </p>
        <div class="suggestions">
          <button
            onclick={() => {
              input = 'What chronic conditions are covered by Discovery Health?';
              sendMessage();
            }}
          >
            💊 Chronic condition coverage
          </button>
          <button
            onclick={() => {
              input = 'What are the hospital benefits for KeyCare plans?';
              sendMessage();
            }}
          >
            🏥 Hospital benefits
          </button>
          <button
            onclick={() => {
              input = 'How much does maternity cover cost on Bonitas?';
              sendMessage();
            }}
          >
            👶 Maternity coverage
          </button>
          <button
            onclick={() => {
              input = 'Compare day-to-day benefits across different plans';
              sendMessage();
            }}
          >
            📊 Compare benefits
          </button>
        </div>
      </div>
    {:else}
      {#each messages as message}
        <div class="message message-{message.role}">
          <div class="message-content">
            {#if message.role === 'assistant'}
              {@html formatMessageContent(message.content, message.sources || [])}
            {:else}
              {message.content}
            {/if}
          </div>
          {#if message.sources && message.sources.length > 0}
            <div class="sources">
              <strong>📚 Sources:</strong>
              <div class="source-links">
                {#each message.sources as source, i}
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="source-link"
                    id="source-{i + 1}"
                    title="{source.provider} - {Math.round(source.relevance * 100)}% relevant"
                  >
                    {i + 1}. {source.title}
                    <span class="provider-badge">{source.provider}</span>
                  </a>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/each}

      {#if loading && messages[messages.length - 1]?.content === ''}
        <div class="streaming-indicator">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      {/if}
    {/if}
  </div>

  <form
    class="input-form"
    onsubmit={e => {
      e.preventDefault();
      sendMessage();
    }}
  >
    <textarea
      bind:value={input}
      onkeydown={handleKeydown}
      placeholder="Ask me anything about your medical aid or insurance..."
      rows="1"
      disabled={loading}
    ></textarea>
    <button type="submit" disabled={!input.trim() || loading}>
      {loading ? '...' : '→'}
    </button>
  </form>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      sans-serif;
    background: #f7f7f8;
  }

  .chat-container {
    max-width: 800px;
    margin: 0 auto;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  header {
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
  }

  header h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.75rem;
    font-weight: 600;
  }

  header p {
    margin: 0 0 1rem 0;
    opacity: 0.9;
    font-size: 0.95rem;
  }

  .provider-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .provider-selector label {
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .provider-selector select {
    padding: 0.5rem 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    outline: none;
    transition: all 0.2s;
  }

  .provider-selector select:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .provider-selector select option {
    background: #667eea;
    color: white;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .welcome {
    text-align: center;
    margin-top: 4rem;
  }

  .welcome h2 {
    color: #333;
    margin-bottom: 0.75rem;
    font-weight: 500;
  }

  .welcome-subtitle {
    color: #6b7280;
    font-size: 0.95rem;
    margin-bottom: 2rem;
    line-height: 1.5;
  }

  .suggestions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 400px;
    margin: 0 auto;
  }

  .suggestions button {
    padding: 1rem;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s;
    text-align: left;
  }

  .suggestions button:hover {
    border-color: #667eea;
    background: #f9fafb;
    transform: translateY(-2px);
  }

  .message {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 85%;
  }

  .message-user {
    align-self: flex-end;
  }

  .message-assistant {
    align-self: flex-start;
  }

  .message-content {
    padding: 1rem 1.25rem;
    border-radius: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .message-user .message-content {
    background: #667eea;
    color: white;
  }

  .message-assistant .message-content {
    background: #f3f4f6;
    color: #1f2937;
  }

  .streaming-indicator {
    display: flex;
    gap: 0.5rem;
    padding: 1rem 1.25rem;
    align-self: flex-start;
    max-width: 85%;
  }

  .dot {
    width: 8px;
    height: 8px;
    background: #9ca3af;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }

  .dot:nth-child(1) {
    animation-delay: -0.32s;
  }

  .dot:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  .sources {
    font-size: 0.85rem;
    color: #6b7280;
    padding-left: 1.25rem;
    margin-top: 0.75rem;
  }

  .sources strong {
    display: block;
    margin-bottom: 0.5rem;
    color: #374151;
  }

  .source-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .source-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    text-decoration: none;
    color: #667eea;
    transition: all 0.2s;
    font-size: 0.9rem;
  }

  .source-link:hover {
    background: #f9fafb;
    border-color: #667eea;
    transform: translateX(4px);
  }

  .provider-badge {
    margin-left: auto;
    padding: 0.25rem 0.5rem;
    background: #f3f4f6;
    border-radius: 4px;
    font-size: 0.75rem;
    color: #6b7280;
  }

  /* Inline source links within message content - icon only */
  :global(.inline-source-link) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #667eea;
    text-decoration: none;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s;
    background: rgba(102, 126, 234, 0.1);
    vertical-align: middle;
    margin: 0 0.125rem;
  }

  :global(.inline-source-link:hover) {
    background: rgba(102, 126, 234, 0.2);
    transform: translateY(-1px);
  }

  :global(.inline-source-link svg) {
    width: 16px;
    height: 16px;
    opacity: 0.8;
  }

  :global(.inline-source-link:hover svg) {
    opacity: 1;
  }

  /* Markdown formatting styles */
  :global(.message-content p) {
    margin: 0 0 0.5rem 0;
  }

  :global(.message-content p:last-child) {
    margin-bottom: 0;
  }

  :global(.message-content strong) {
    font-weight: 600;
  }

  :global(.message-content em) {
    font-style: italic;
  }

  :global(.message-content ul),
  :global(.message-content ol) {
    margin: 0.25rem 0;
    padding-left: 1.5rem;
  }

  :global(.message-content li) {
    margin: 0.125rem 0;
    line-height: 1.5;
  }

  :global(.message-content code) {
    background: rgba(0, 0, 0, 0.05);
    padding: 0.125rem 0.375rem;
    border-radius: 3px;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
  }

  :global(.message-content pre) {
    background: rgba(0, 0, 0, 0.05);
    padding: 0.75rem;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0.5rem 0;
  }

  :global(.message-content pre code) {
    background: none;
    padding: 0;
  }

  :global(.message-content blockquote) {
    border-left: 3px solid #667eea;
    padding-left: 1rem;
    margin: 0.5rem 0;
    color: #6b7280;
  }

  :global(.message-content h1),
  :global(.message-content h2),
  :global(.message-content h3) {
    margin: 1rem 0 0.5rem 0;
    font-weight: 600;
  }

  :global(.message-content h1) {
    font-size: 1.5em;
  }

  :global(.message-content h2) {
    font-size: 1.25em;
  }

  :global(.message-content h3) {
    font-size: 1.1em;
  }

  .input-form {
    padding: 1.5rem 2rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 0.75rem;
    background: white;
  }

  textarea {
    flex: 1;
    padding: 0.875rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-family: inherit;
    font-size: 1rem;
    resize: none;
    outline: none;
    transition: border-color 0.2s;
  }

  textarea:focus {
    border-color: #667eea;
  }

  textarea:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }

  button[type='submit'] {
    width: 48px;
    height: 48px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  button[type='submit']:hover:not(:disabled) {
    background: #5568d3;
    transform: scale(1.05);
  }

  button[type='submit']:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
</style>

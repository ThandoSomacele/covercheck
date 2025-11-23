<script lang="ts">
  import { marked } from 'marked';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';

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

  function resetChat() {
    messages = [];
    input = '';
  }

  // Configure marked options
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  const providers = [
    { value: 'all', label: 'All Providers' },
    { value: 'Discovery Health', label: 'Discovery Health' },
    { value: 'Bonitas Medical Fund', label: 'Bonitas Medical Fund' },
    { value: 'Momentum Health', label: 'Momentum Health' },
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
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

<svelte:head>
  <title>CoverCheck - South African Medical Aid Assistant</title>
  <meta name="description" content="Get instant answers about South African medical aid plans from Discovery Health, Bonitas, and Momentum. Compare benefits, coverage, and costs with AI-powered assistance." />
</svelte:head>

<div class="app">
  <header class="header">
    <div class="header-content">
      <button class="logo" onclick={resetChat} aria-label="Reset chat and return to home">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
        <span class="logo-text">CoverCheck</span>
      </button>

      <div class="header-actions">
        <div class="provider-selector">
          <select bind:value={selectedProvider} aria-label="Select provider">
            {#each providers as provider}
              <option value={provider.value}>{provider.label}</option>
            {/each}
          </select>
          <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
        <ThemeToggle />
      </div>
    </div>
  </header>

  {#if messages.length === 0}
  <!-- Welcome/Empty state with centered input like ChatGPT -->
  <div class="welcome-container">
    <div class="welcome">
      <div class="welcome-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
      </div>
      <h1 class="welcome-title">How can I help you today?</h1>
      <p class="welcome-subtitle">
        Ask questions about South African medical aid plans
      </p>
    </div>

    <div class="centered-input-wrapper">
      <form
        class="input-form centered"
        onsubmit={e => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <div class="input-wrapper">
          <textarea
            bind:value={input}
            onkeydown={handleKeydown}
            placeholder="Ask about medical aid coverage, benefits, costs..."
            rows="1"
            disabled={loading}
          ></textarea>
          <button type="submit" class="send-btn" disabled={!input.trim() || loading} aria-label="Send message">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z"></path>
              <path d="M22 2 11 13"></path>
            </svg>
          </button>
        </div>
      </form>

      <div class="suggestions">
        <button
          class="suggestion-chip"
          onclick={() => {
            input = 'What chronic conditions are covered by Discovery Health?';
            sendMessage();
          }}
        >
          <span>Chronic condition coverage</span>
        </button>
        <button
          class="suggestion-chip"
          onclick={() => {
            input = 'What are the hospital benefits for KeyCare plans?';
            sendMessage();
          }}
        >
          <span>Hospital benefits</span>
        </button>
        <button
          class="suggestion-chip"
          onclick={() => {
            input = 'How much does maternity cover cost on Bonitas?';
            sendMessage();
          }}
        >
          <span>Maternity coverage</span>
        </button>
        <button
          class="suggestion-chip"
          onclick={() => {
            input = 'Compare day-to-day benefits across different plans';
            sendMessage();
          }}
        >
          <span>Compare benefits</span>
        </button>
      </div>
      <p class="disclaimer">
        CoverCheck provides AI-generated information for reference only. Always verify details directly with your medical aid provider before making healthcare decisions.
      </p>
    </div>
  </div>
  {:else}

  <main class="main">
    <div class="chat-container">
        <div class="messages">
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
                  <div class="sources-header">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    <span>Sources ({message.sources.length})</span>
                  </div>
                  <div class="source-links">
                    {#each message.sources as source, i}
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="source-link"
                        title="View source: {source.title}"
                      >
                        <span class="source-number">{i + 1}</span>
                        <div class="source-info">
                          <span class="source-title">{source.title}</span>
                          <div class="source-meta">
                            <span class="source-provider">{source.provider}</span>
                            <span class="source-relevance-dot">•</span>
                            <span class="source-relevance" class:high-relevance={source.relevance >= 0.7} class:medium-relevance={source.relevance >= 0.5 && source.relevance < 0.7}>
                              {Math.round(source.relevance * 100)}% match
                            </span>
                          </div>
                        </div>
                        <svg class="source-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M7 17L17 7"></path>
                          <path d="M7 7h10v10"></path>
                        </svg>
                      </a>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {/each}

          {#if loading && messages[messages.length - 1]?.content === ''}
            <div class="loading-indicator">
              <div class="loading-dots">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
          {/if}
        </div>
    </div>
  </main>

  <footer class="footer">
    <form
      class="input-form"
      onsubmit={e => {
        e.preventDefault();
        sendMessage();
      }}
    >
      <div class="input-wrapper">
        <textarea
          bind:value={input}
          onkeydown={handleKeydown}
          placeholder="Message CoverCheck..."
          rows="1"
          disabled={loading}
        ></textarea>
        <button type="submit" class="send-btn" disabled={!input.trim() || loading} aria-label="Send message">
          {#if loading}
            <div class="btn-loading">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          {:else}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z"></path>
              <path d="M22 2 11 13"></path>
            </svg>
          {/if}
        </button>
      </div>
    </form>
    <p class="disclaimer">
      CoverCheck provides AI-generated information for reference only. Always verify details directly with your medical aid provider before making healthcare decisions.
    </p>
  </footer>
  {/if}
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--background);
  }

  /* Header */
  .header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--background);
    border-bottom: 1px solid var(--border);
  }

  /* Welcome container - ChatGPT/Gemini style centered layout */
  .welcome-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-6);
    gap: var(--space-8);
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-6);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--foreground);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: opacity var(--transition-fast);
  }

  .logo:hover {
    opacity: 0.8;
  }

  .logo svg {
    color: var(--accent);
    transition: transform var(--transition-fast);
  }

  .logo:hover svg {
    transform: scale(1.05);
  }

  .logo-text {
    font-size: 1.125rem;
    font-weight: 600;
    letter-spacing: -0.025em;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .provider-selector {
    position: relative;
  }

  .provider-selector select {
    appearance: none;
    padding: var(--space-2) var(--space-8) var(--space-2) var(--space-3);
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--foreground);
    font-size: 0.875rem;
    font-family: inherit;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .provider-selector select:hover {
    border-color: var(--border-hover);
  }

  .provider-selector select:focus {
    outline: none;
    border-color: var(--foreground);
  }

  .select-icon {
    position: absolute;
    right: var(--space-3);
    top: 50%;
    transform: translateY(-50%);
    color: var(--foreground-tertiary);
    pointer-events: none;
  }

  /* Main content */
  .main {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-6);
  }

  .chat-container {
    max-width: 800px;
    margin: 0 auto;
    padding-bottom: var(--space-8);
  }

  /* Welcome state - Modern AI style */
  .welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .welcome-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: var(--accent-light);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-4);
    color: var(--accent);
  }

  .welcome-title {
    font-size: 2rem;
    font-weight: 600;
    color: var(--foreground);
    margin: 0 0 var(--space-2) 0;
    letter-spacing: -0.03em;
  }

  .welcome-subtitle {
    font-size: 1rem;
    color: var(--foreground-secondary);
    margin: 0;
    line-height: 1.5;
  }

  .centered-input-wrapper {
    width: 100%;
    max-width: 680px;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .input-form.centered {
    margin: 0;
  }

  .input-form.centered .input-wrapper {
    box-shadow: var(--shadow-lg);
  }

  /* Suggestion chips - Gemini/ChatGPT style */
  .suggestions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-2);
  }

  .suggestion-chip {
    display: inline-flex;
    align-items: center;
    padding: var(--space-2) var(--space-4);
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    color: var(--foreground-secondary);
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .suggestion-chip:hover {
    border-color: var(--border-hover);
    background: var(--background-secondary);
    color: var(--foreground);
  }

  /* Messages */
  .messages {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .message {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .message-user {
    align-items: flex-end;
  }

  .message-assistant {
    align-items: flex-start;
  }

  .message-content {
    max-width: 85%;
    padding: var(--space-4) var(--space-5);
    border-radius: var(--radius-lg);
    line-height: 1.6;
    font-size: 0.9375rem;
  }

  .message-user .message-content {
    background: var(--message-user-bg);
    color: var(--message-user-fg);
    border-bottom-right-radius: var(--radius-sm);
  }

  .message-assistant .message-content {
    background: var(--message-assistant-bg);
    color: var(--message-assistant-fg);
    border: 1px solid var(--border);
    border-bottom-left-radius: var(--radius-sm);
  }

  /* Loading indicator */
  .loading-indicator {
    align-self: flex-start;
    padding: var(--space-4) var(--space-5);
  }

  .loading-dots {
    display: flex;
    gap: var(--space-2);
  }

  .loading-dots .dot,
  .btn-loading .dot {
    width: 6px;
    height: 6px;
    background: var(--foreground-muted);
    border-radius: 50%;
    animation: pulse 1.4s ease-in-out infinite;
  }

  .loading-dots .dot:nth-child(1) { animation-delay: 0s; }
  .loading-dots .dot:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots .dot:nth-child(3) { animation-delay: 0.4s; }

  .btn-loading {
    display: flex;
    gap: 3px;
  }

  .btn-loading .dot {
    width: 4px;
    height: 4px;
    background: var(--accent-foreground);
  }

  @keyframes pulse {
    0%, 80%, 100% {
      opacity: 0.3;
      transform: scale(0.8);
    }
    40% {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Sources */
  .sources {
    max-width: 85%;
    font-size: 0.8125rem;
  }

  .sources-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--foreground-secondary);
    margin-bottom: var(--space-3);
    font-weight: 500;
  }

  .source-links {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .source-link {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--foreground);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .source-link:hover {
    border-color: var(--border-hover);
    background: var(--background-secondary);
  }

  .source-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: var(--accent-light);
    color: var(--accent);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-weight: 600;
    flex-shrink: 0;
  }

  .source-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
  }

  .source-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  .source-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 0.75rem;
  }

  .source-provider {
    color: var(--foreground-tertiary);
  }

  .source-relevance-dot {
    color: var(--foreground-tertiary);
    font-size: 0.625rem;
  }

  .source-relevance {
    color: var(--foreground-secondary);
    font-weight: 500;
  }

  .source-relevance.high-relevance {
    color: #10b981;
  }

  .source-relevance.medium-relevance {
    color: #f59e0b;
  }

  .source-arrow {
    color: var(--foreground-muted);
    flex-shrink: 0;
    opacity: 0;
    transform: translateX(-4px);
    transition: all var(--transition-fast);
  }

  .source-link:hover .source-arrow {
    opacity: 1;
    transform: translateX(0);
  }

  /* Inline source links */
  :global(.inline-source-link) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    text-decoration: none;
    padding: 2px;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    background: var(--accent-light);
    vertical-align: middle;
    margin: 0 2px;
  }

  :global(.inline-source-link:hover) {
    background: var(--accent);
    color: var(--accent-foreground);
  }

  :global(.inline-source-link svg) {
    width: 14px;
    height: 14px;
  }

  /* Markdown content styles */
  :global(.message-content p) {
    margin: 0 0 var(--space-3) 0;
  }

  :global(.message-content p:last-child) {
    margin-bottom: 0;
  }

  :global(.message-content strong) {
    font-weight: 600;
  }

  :global(.message-content ul),
  :global(.message-content ol) {
    margin: var(--space-2) 0;
    padding-left: var(--space-6);
  }

  :global(.message-content li) {
    margin: var(--space-1) 0;
  }

  :global(.message-content blockquote) {
    border-left: 2px solid var(--accent);
    padding-left: var(--space-4);
    margin: var(--space-3) 0;
    color: var(--foreground-secondary);
  }

  :global(.message-content h1),
  :global(.message-content h2),
  :global(.message-content h3) {
    margin: var(--space-4) 0 var(--space-2) 0;
    font-weight: 600;
  }

  :global(.message-content h1) { font-size: 1.375rem; }
  :global(.message-content h2) { font-size: 1.125rem; }
  :global(.message-content h3) { font-size: 1rem; }

  /* Footer/Input */
  .footer {
    border-top: 1px solid var(--border);
    background: var(--background);
    padding: var(--space-4) var(--space-6);
  }

  .input-form {
    max-width: 700px;
    margin: 0 auto;
  }

  .disclaimer {
    max-width: 700px;
    margin: var(--space-3) auto 0;
    text-align: center;
    font-size: 0.75rem;
    color: var(--foreground-tertiary);
    line-height: 1.5;
  }

  .input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: var(--space-3);
    padding: var(--space-3);
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-lg);
    transition: border-color var(--transition-fast);
  }

  .input-wrapper:focus-within {
    border-color: var(--input-focus-border);
  }

  textarea {
    flex: 1;
    padding: var(--space-2);
    background: transparent;
    border: none;
    color: var(--foreground);
    font-family: inherit;
    font-size: 0.9375rem;
    line-height: 1.5;
    resize: none;
    outline: none;
    min-height: 24px;
    max-height: 200px;
  }

  textarea::placeholder {
    color: var(--input-placeholder);
  }

  textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: var(--accent);
    color: var(--accent-foreground);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
    flex-shrink: 0;
  }

  .send-btn:hover:not(:disabled) {
    background: var(--accent-hover);
    transform: scale(1.05);
  }

  .send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .header-content {
      padding: var(--space-3) var(--space-4);
    }

    .main {
      padding: var(--space-4);
    }

    .footer {
      padding: var(--space-3) var(--space-4);
    }

    .welcome-container {
      padding: var(--space-4);
      gap: var(--space-6);
    }

    .welcome-icon {
      width: 56px;
      height: 56px;
    }

    .welcome-icon svg {
      width: 40px;
      height: 40px;
    }

    .welcome-title {
      font-size: 1.5rem;
    }

    .welcome-subtitle {
      font-size: 0.875rem;
    }

    .suggestion-chip {
      font-size: 0.75rem;
      padding: var(--space-2) var(--space-3);
    }

    .message-content {
      max-width: 95%;
      padding: var(--space-3) var(--space-4);
      font-size: 0.875rem;
    }

    .sources {
      max-width: 95%;
    }

    .source-link {
      padding: var(--space-2) var(--space-3);
      gap: var(--space-2);
    }

    .source-number {
      width: 20px;
      height: 20px;
      font-size: 0.6875rem;
    }

    .source-title {
      font-size: 0.8125rem;
    }

    .source-meta {
      font-size: 0.6875rem;
      gap: var(--space-1);
    }

    .provider-selector select {
      font-size: 0.8125rem;
      padding: var(--space-2) var(--space-6) var(--space-2) var(--space-2);
    }

    .logo-text {
      font-size: 1rem;
    }

    .input-wrapper {
      padding: var(--space-2);
    }

    textarea {
      font-size: 0.875rem;
    }
  }

  @media (max-width: 480px) {
    .header-content {
      padding: var(--space-2) var(--space-3);
    }

    .logo svg {
      width: 20px;
      height: 20px;
    }

    .logo-text {
      font-size: 0.9375rem;
    }

    .provider-selector select {
      font-size: 0.75rem;
      padding: var(--space-1) var(--space-5) var(--space-1) var(--space-2);
    }

    .select-icon {
      width: 14px;
      height: 14px;
      right: var(--space-2);
    }

    .suggestions {
      gap: var(--space-1);
    }

    .suggestion-chip {
      font-size: 0.6875rem;
      padding: var(--space-1) var(--space-3);
    }

    .message-content {
      max-width: 98%;
      padding: var(--space-3);
      font-size: 0.8125rem;
    }

    .sources-header {
      font-size: 0.75rem;
    }

    .sources-header svg {
      width: 12px;
      height: 12px;
    }

    .source-link {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-2);
    }

    .source-info {
      width: 100%;
    }

    .source-arrow {
      display: none;
    }

    .welcome-title {
      font-size: 1.25rem;
    }

    .welcome-icon {
      width: 48px;
      height: 48px;
    }

    .welcome-icon svg {
      width: 32px;
      height: 32px;
    }
  }
</style>

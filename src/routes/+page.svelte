<script lang="ts">
	let messages = $state<Array<{ role: 'user' | 'assistant'; content: string; sources?: string[] }>>([]);
	let input = $state('');
	let loading = $state(false);

	async function sendMessage() {
		if (!input.trim() || loading) return;

		const userMessage = input.trim();
		input = '';

		// Add user message to chat
		messages = [...messages, { role: 'user', content: userMessage }];
		loading = true;

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ message: userMessage })
			});

			const data = await response.json();

			if (data.error) {
				messages = [
					...messages,
					{ role: 'assistant', content: `Error: ${data.error}` }
				];
			} else {
				messages = [
					...messages,
					{
						role: 'assistant',
						content: data.response,
						sources: data.sources
					}
				];
			}
		} catch (error) {
			messages = [
				...messages,
				{ role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
			];
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
</script>

<div class="chat-container">
	<header>
		<h1>🇿🇦 Insurance Assistant</h1>
		<p>Your medical aid and insurance questions answered simply</p>
	</header>

	<div class="messages">
		{#if messages.length === 0}
			<div class="welcome">
				<h2>👋 Hello! How can I help you today?</h2>
				<div class="suggestions">
					<button onclick={() => { input = "If I break my arm, what will I pay?"; sendMessage(); }}>
						💰 Cost example
					</button>
					<button onclick={() => { input = "What's the difference between Plan A and Plan B?"; sendMessage(); }}>
						📊 Compare plans
					</button>
					<button onclick={() => { input = "How do I file a claim?"; sendMessage(); }}>
						📋 Filing claims
					</button>
				</div>
			</div>
		{:else}
			{#each messages as message}
				<div class="message message-{message.role}">
					<div class="message-content">
						{message.content}
					</div>
					{#if message.sources && message.sources.length > 0}
						<div class="sources">
							<strong>Sources:</strong>
							<ul>
								{#each message.sources as source}
									<li>{source}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			{/each}

			{#if loading}
				<div class="message message-assistant">
					<div class="message-content loading">
						<span class="dot"></span>
						<span class="dot"></span>
						<span class="dot"></span>
					</div>
				</div>
			{/if}
		{/if}
	</div>

	<form class="input-form" onsubmit={(e) => { e.preventDefault(); sendMessage(); }}>
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
		font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
		margin: 0;
		opacity: 0.9;
		font-size: 0.95rem;
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
		margin-bottom: 2rem;
		font-weight: 500;
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

	.loading {
		display: flex;
		gap: 0.5rem;
		padding: 1.5rem 2rem;
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
		0%, 80%, 100% {
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
	}

	.sources ul {
		margin: 0.5rem 0 0 0;
		padding-left: 1.5rem;
	}

	.sources li {
		margin: 0.25rem 0;
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

	button[type="submit"] {
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

	button[type="submit"]:hover:not(:disabled) {
		background: #5568d3;
		transform: scale(1.05);
	}

	button[type="submit"]:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}
</style>

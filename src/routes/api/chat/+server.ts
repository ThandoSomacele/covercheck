import { json } from '@sveltejs/kit';
import { queryInsuranceStream } from '$lib/server/rag-semantic';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { message, provider } = await request.json();

		if (!message) {
			return json({ error: 'Message is required' }, { status: 400 });
		}

		// Create a streaming response
		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();

				try {
					// Stream the response chunks
					for await (const chunk of queryInsuranceStream(message, provider)) {
						const data = JSON.stringify(chunk) + '\n';
						controller.enqueue(encoder.encode(data));
					}
				} catch (error) {
					console.error('Streaming error:', error);
					const errorChunk = JSON.stringify({
						type: 'error',
						data: 'An error occurred while processing your request'
					}) + '\n';
					controller.enqueue(encoder.encode(errorChunk));
				} finally {
					controller.close();
				}
			}
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive'
			}
		});
	} catch (error: any) {
		console.error('Error:', error);
		return json({ error: 'An error occurred while processing your request' }, { status: 500 });
	}
};

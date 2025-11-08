import { json } from '@sveltejs/kit';
import { queryInsurance } from '$lib/server/rag-semantic';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { message, provider } = await request.json();

		if (!message) {
			return json({ error: 'Message is required' }, { status: 400 });
		}

		// Query the insurance system with optional provider filter
		const result = await queryInsurance(message, provider);

		return json(result);
	} catch (error: any) {
		console.error('Error:', error);
		return json({ error: 'An error occurred while processing your request' }, { status: 500 });
	}
};

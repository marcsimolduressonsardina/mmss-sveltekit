import type { PageServerLoad } from './$types';
import { OrderCreationUtilities } from '$lib/server/shared/order/order-creation.utilities';

export const load = (async ({ locals }) => {
	return await OrderCreationUtilities.handleCreateOrderFormPage(locals);
}) satisfies PageServerLoad;

export const actions = {
	async createOrder({ request, locals }) {
		return await OrderCreationUtilities.handleCreateOrder(false, request, locals);
	},

	async createQuote({ request, locals }) {
		return await OrderCreationUtilities.handleCreateOrder(true, request, locals);
	}
};

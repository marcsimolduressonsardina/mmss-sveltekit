import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { OrderService } from '$lib/server/service/order.service';

export const load = (async ({ locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	if (!appUser.priceManager) {
		throw error(403);
	}
	const orderService = new OrderService(appUser);
	await orderService.indexOrders();

	return { result: true };
}) satisfies PageServerLoad;

import { OrderService } from '$lib/server/service/order.service';
import type { PageServerLoad } from './$types';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const orderService = new OrderService(appUser);
	return { orders: orderService.getOrdersByCustomerId(id) };
}) satisfies PageServerLoad;

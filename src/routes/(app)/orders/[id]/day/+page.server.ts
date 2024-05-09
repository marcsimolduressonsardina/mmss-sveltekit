import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { OrderService } from '$lib/server/service/order.service';
import { AuthUtilities } from '$lib/shared/auth.utilites';

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const orderService = new OrderService(appUser);
	const order = await orderService.getOrderById(id);
	if (order == null) {
		throw redirect(303, '/');
	}

	return { orders: orderService.getOrdersOnSameDay(order) };
}) satisfies PageServerLoad;

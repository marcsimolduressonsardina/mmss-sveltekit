import { OrderService } from '$lib/server/service/order.service';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const orderService = new OrderService(appUser);
	const order = await orderService.getOrderById(id);

	if (order == null) {
		return fail(404, { missing: true });
	}

	const orderCounters = await orderService.getOrdersCountOnSameDay(order);

	return { order, orderCounters };
}) satisfies PageServerLoad;

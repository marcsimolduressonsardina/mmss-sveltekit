import { OrderService } from '$lib/server/service/order.service';
import { AuthUtilities } from '$lib/shared/auth.utilites';
import { OrderStatus } from '$lib/type/order.type';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals, url }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	let status = url.searchParams.get('status') || OrderStatus.PENDING;
	if (status !== OrderStatus.PENDING && status !== OrderStatus.FINISHED) {
		status = OrderStatus.PENDING;
	}

	const orderService = new OrderService(appUser);
	const orders = orderService.getOrdersByStatus(status as OrderStatus);

	return { orders, status };
}) satisfies PageServerLoad;

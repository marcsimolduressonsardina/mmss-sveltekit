import { OrderService } from '$lib/server/service/order.service';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { OrderStatus } from '$lib/type/order.type';
import type { PageServerLoad } from './$types';
import type { FullOrder } from '../../../../lib/type/api.type';

export const load = (async ({ locals, url }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const allowedStatus = [OrderStatus.QUOTE, OrderStatus.PENDING, OrderStatus.FINISHED];
	let status = (url.searchParams.get('status') as OrderStatus) || OrderStatus.PENDING;
	if (allowedStatus.indexOf(status) === -1) {
		status = OrderStatus.PENDING;
	}

	const orderService = new OrderService(appUser);
	const emptyArrayPromise = new Promise<FullOrder[]>((resolve) => {
		resolve([]);
	});

	const orders = appUser.priceManager
		? orderService.getOrdersByStatus(status as OrderStatus)
		: emptyArrayPromise;
	return { orders, status };
}) satisfies PageServerLoad;

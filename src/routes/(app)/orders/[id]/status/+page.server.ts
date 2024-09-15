import { OrderService } from '$lib/server/service/order.service';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, RouteParams } from './$types';
import { OrderStatus } from '$lib/type/order.type';
import type { Order } from '$lib/type/api.type';

async function setOrderStatus(
	status: OrderStatus,
	params: RouteParams,
	locals: App.Locals
): Promise<Order> {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;

	if (!appUser.priceManager && status === OrderStatus.DELETED) {
		throw fail(403, {});
	}

	const orderService = new OrderService(appUser);

	const order = await orderService.getOrderById(id);
	if (!order) {
		throw fail(500, { missing: true });
	}

	await orderService.setOrderStatus(order, status);
	return order;
}

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const orderService = new OrderService(appUser);
	const order = await orderService.getOrderById(id);

	if (order == null) {
		return fail(404, { missing: true });
	}

	return { order };
}) satisfies PageServerLoad;

export const actions = {
	async changeOrderStatus({ request, locals, params }) {
		const formData = await request.formData();
		const newStatus = formData.get('status') as OrderStatus;
		const order = await setOrderStatus(newStatus, params, locals);
		redirect(303, `/orders/${order.id}`);
	}
};

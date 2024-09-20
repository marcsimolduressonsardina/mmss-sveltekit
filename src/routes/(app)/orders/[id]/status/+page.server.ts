import { OrderService } from '$lib/server/service/order.service';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, RouteParams } from './$types';
import { OrderStatus } from '$lib/type/order.type';
import type { Order } from '$lib/type/api.type';
import { ConfigService } from '$lib/server/service/config.service';

async function setOrderStatus(
	status: OrderStatus,
	params: RouteParams,
	locals: App.Locals,
	formLocation?: string
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

	const location =
		status === OrderStatus.FINISHED && formLocation != null ? formLocation : undefined;
	await orderService.setOrderStatus(order, status, location);
	return order;
}

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const orderService = new OrderService(appUser);
	const order = await orderService.getOrderById(id);
	const configService = new ConfigService(appUser);
	const locations = await configService.getLocationsList();

	if (order == null) {
		return fail(404, { missing: true });
	}

	return { order, locations };
}) satisfies PageServerLoad;

export const actions = {
	async changeOrderStatus({ request, locals, params }) {
		const formData = await request.formData();
		const newStatus = formData.get('status') as OrderStatus;
		const location = formData.get('location')?.toString();
		const order = await setOrderStatus(newStatus, params, locals, location);
		redirect(303, `/orders/${order.id}`);
	}
};
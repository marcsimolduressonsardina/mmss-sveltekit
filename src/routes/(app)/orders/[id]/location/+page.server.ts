import { OrderService } from '$lib/server/service/order.service';
import type { PageServerLoad } from './$types';
import { redirect, type Actions } from '@sveltejs/kit';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { OrderStatus } from '$lib/type/order.type';
import { ConfigService } from '$lib/server/service/config.service';

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const orderService = new OrderService(appUser);

	const order = await orderService.getOrderById(id);
	if (!order) {
		return redirect(302, `/`);
	}

	if (order.status === OrderStatus.QUOTE) {
		return redirect(302, `/orders/${id}`);
	}

	const configService = new ConfigService(appUser);
	const locations = await configService.getLocationsList();
	return { locations };
}) satisfies PageServerLoad;

export const actions: Actions = {
	saveLocation: async ({ request, locals, params }) => {
		const appUser = await AuthUtilities.checkAuth(locals);
		const { id } = params;
		const orderService = new OrderService(appUser);

		const order = await orderService.getOrderById(id!);
		if (!order) {
			return redirect(302, `/`);
		}

		if (order.status === OrderStatus.QUOTE) {
			return redirect(302, `/orders/${id}`);
		}

		const formData = await request.formData();
		const location = formData.get('location') as string;
		await orderService.setOrderStatus(order, OrderStatus.FINISHED, location);
		return redirect(302, `/orders/${id}`);
	}
};

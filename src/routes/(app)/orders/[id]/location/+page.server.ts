import type { PageServerLoad } from './$types';
import { redirect, type Actions } from '@sveltejs/kit';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { ConfigService, OrderService, OrderStatus } from '@marcsimolduressonsardina/core';
import { AuthService } from '$lib/server/service/auth.service';

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const config = AuthService.generateConfiguration(appUser);
	const orderService = new OrderService(config);
	const order = await orderService.getOrderById(id);
	if (!order) {
		return redirect(302, `/`);
	}

	if (order.status === OrderStatus.QUOTE) {
		return redirect(302, `/orders/${id}`);
	}

	const configService = new ConfigService(config);
	const locations = await configService.getLocationsList();
	return { locations };
}) satisfies PageServerLoad;

export const actions: Actions = {
	saveLocation: async ({ request, locals, params }) => {
		const appUser = await AuthUtilities.checkAuth(locals);
		const { id } = params;
		const orderService = new OrderService(AuthService.generateConfiguration(appUser));

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

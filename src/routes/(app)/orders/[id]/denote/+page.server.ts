import type { PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { OrderService, OrderStatus } from '@marcsimolduressonsardina/core';
import { AuthService } from '$lib/server/service/auth.service';

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const orderService = new OrderService(AuthService.generateConfiguration(appUser));
	const order = await orderService.getOrderById(id);
	if (!order) {
		return redirect(302, `/`);
	}

	if (order.status === OrderStatus.QUOTE) {
		return redirect(302, `/orders/${id}`);
	}

	return { order };
}) satisfies PageServerLoad;

export const actions = {
	async default({ locals, params }) {
		const appUser = await AuthUtilities.checkAuth(locals);

		const { id } = params;
		const orderService = new OrderService(AuthService.generateConfiguration(appUser));

		const order = await orderService.getOrderById(id);
		if (!order || order.status === OrderStatus.QUOTE) {
			return fail(404, { missing: true });
		}

		await orderService.moveOrderToQuote(order);
		return redirect(302, `/orders/${id}`);
	}
};

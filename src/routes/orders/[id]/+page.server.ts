import { AuthService } from '$lib/server/service/auth.service';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { OrderService } from '$lib/server/service/order.service';
import { CalculatedItemService } from '$lib/server/service/calculated-item.service';

export const load = (async ({ params, locals }) => {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session?.user);
	if (!appUser) throw redirect(303, '/auth/signin');
	const { id } = params;
	const orderService = new OrderService(appUser);
	const calculatedItemService = new CalculatedItemService();

	return {
		order: orderService.getOrderById(id),
		calculatedItem: await calculatedItemService.getCalculatedItem(id)
	};
}) satisfies PageServerLoad;

export const actions = {
	async deleteOrder({ params, locals }) {
		const session = await locals.auth();
		const appUser = AuthService.generateUserFromAuth(session?.user);
		if (!appUser) throw redirect(303, '/auth/signin');
		const { id } = params;
		const orderService = new OrderService(appUser);

		const order = await orderService.getOrderById(id);
		if (!order) {
			return fail(500, { missing: true });
		}

		await orderService.deleteOrder(order);
		redirect(303, `/customers/${order.customer.id}/`);
	},

	async payOrderFull({ params, locals }) {
		const session = await locals.auth();
		const appUser = AuthService.generateUserFromAuth(session?.user);
		if (!appUser) throw redirect(303, '/auth/signin');
		const { id } = params;
		const orderService = new OrderService(appUser);

		const order = await orderService.getOrderById(id);
		if (!order) {
			return fail(500, { missing: true });
		}

		await orderService.setOrderFullyPaid(order);
		redirect(303, `/orders/${id}/`);
	},

	async unpayOrder({ params, locals }) {
		const session = await locals.auth();
		const appUser = AuthService.generateUserFromAuth(session?.user);
		if (!appUser) throw redirect(303, '/auth/signin');
		const { id } = params;

		const orderService = new OrderService(appUser);
		const order = await orderService.getOrderById(id);
		if (!order) {
			return fail(500, { missing: true });
		}

		await orderService.setOrderPartiallyPaid(order, 0);
		redirect(303, `/orders/${id}/`);
	},

	async payOrderPartially({ params, locals, request }) {
		const session = await locals.auth();
		const appUser = AuthService.generateUserFromAuth(session?.user);
		if (!appUser) throw redirect(303, '/auth/signin');
		const { id } = params;
		const data = await request.formData();
		const amount = data.get('amount')?.toString();

		if (amount == null) {
			return fail(400, { missing: true });
		}

		const amountNumber = parseFloat(amount);
		if (isNaN(amountNumber) || amountNumber < 0) {
			return fail(400, { invalid: true });
		}

		const orderService = new OrderService(appUser);

		const order = await orderService.getOrderById(id);
		if (!order) {
			return fail(500, { missing: true });
		}

		await orderService.incrementOrderPayment(order, amountNumber);
		redirect(303, `/orders/${id}/`);
	}
};

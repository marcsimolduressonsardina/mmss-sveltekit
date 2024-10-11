import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { OrderService, PaymentStatus } from '@marcsimolduressonsardina/core';
import { AuthService } from '$lib/server/service/auth.service';

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const orderService = new OrderService(AuthService.generateConfiguration(appUser));
	const fullOrder = await orderService.getFullOrderById(id);

	if (fullOrder == null) {
		return fail(404, { missing: true });
	}

	return { order: fullOrder.order, calculatedItem: fullOrder.calculatedItem };
}) satisfies PageServerLoad;

export const actions = {
	async changePayment({ request, locals, params }) {
		const formData = await request.formData();
		const newStatus = formData.get('paymentStatus') as PaymentStatus;
		const amount = formData.get('amount')?.toString();

		const appUser = await AuthUtilities.checkAuth(locals);
		const { id } = params;
		const orderService = new OrderService(AuthService.generateConfiguration(appUser));
		const order = await orderService.getOrderById(id);
		if (!order) {
			return fail(500, { missing: true });
		}

		if (newStatus === PaymentStatus.FULLY_PAID) {
			await orderService.setOrderFullyPaid(order);
		}

		if (newStatus === PaymentStatus.UNPAID) {
			await orderService.setOrderPartiallyPaid(order, 0);
		}

		if (newStatus === PaymentStatus.PARTIALLY_PAID) {
			if (amount == null) {
				return fail(400, { missing: true });
			}
			const amountNumber = parseFloat(amount);
			if (isNaN(amountNumber) || amountNumber < 0) {
				return fail(400, { invalid: true });
			}

			await orderService.setOrderPartiallyPaid(order, amountNumber);
		}

		redirect(303, `/orders/${order.id}`);
	}
};

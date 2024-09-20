import { OrderService } from '$lib/server/service/order.service';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PaymentStatus } from '$lib/type/order.type';

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
	async changePayment({ request, locals, params }) {
		const formData = await request.formData();
		const newStatus = formData.get('paymentStatus') as PaymentStatus;
		const amount = formData.get('amount')?.toString();

		const appUser = await AuthUtilities.checkAuth(locals);
		const { id } = params;
		const orderService = new OrderService(appUser);

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
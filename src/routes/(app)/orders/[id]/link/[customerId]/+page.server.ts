import type { PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { AuthService } from '$lib/server/service/auth.service';
import { CustomerService, OrderService, OrderUtilities } from '@marcsimolduressonsardina/core';

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);

	const { id, customerId } = params;
	const config = AuthService.generateConfiguration(appUser);
	const customerService = new CustomerService(config);
	const orderService = new OrderService(config, customerService);

	const customer = await customerService.getCustomerById(customerId);

	if (customer == null) {
		return fail(404, { missing: true });
	}

	const order = await orderService.getOrderById(id);
	if (!order || !OrderUtilities.isOrderTemp(order)) {
		return fail(404, { missing: true });
	}

	await orderService.addCustomerToTemporaryOrder(customer, order);

	return redirect(302, `/orders/${id}/files`);
}) satisfies PageServerLoad;

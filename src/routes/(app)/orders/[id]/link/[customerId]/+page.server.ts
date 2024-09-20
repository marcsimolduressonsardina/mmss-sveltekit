import { OrderService } from '$lib/server/service/order.service';
import type { PageServerLoad } from './$types';
import { isOrderTemp } from '$lib/shared/order.utilities';
import { fail, redirect } from '@sveltejs/kit';
import { CustomerService } from '$lib/server/service/customer.service';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);

	const { id, customerId } = params;
	const customerService = new CustomerService(appUser);
	const orderService = new OrderService(appUser, customerService);
	const customer = await customerService.getCustomerById(customerId);

	if (customer == null) {
		return fail(404, { missing: true });
	}

	const order = await orderService.getOrderById(id);
	if (!order || !isOrderTemp(order)) {
		return fail(404, { missing: true });
	}

	await orderService.addCustomerToTemporaryOrder(customer, order);

	return redirect(302, `/orders/${id}/files`);
}) satisfies PageServerLoad;

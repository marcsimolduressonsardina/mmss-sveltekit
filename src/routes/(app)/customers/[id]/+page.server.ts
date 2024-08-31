import { CustomerService } from '$lib/server/service/customer.service';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { OrderService } from '$lib/server/service/order.service';

export const load = (async ({ params, locals }) => {
	const { id } = params;
	const appUser = await AuthUtilities.checkAuth(locals);
	const customerService = new CustomerService(appUser);
	const orderService = new OrderService(appUser, customerService);
	const customer = customerService.getCustomerById(id);
	const orders = await orderService.getOrdersByCustomerId(id);
	return { customer, isPriceManager: appUser.priceManager, totalOrders: orders?.length ?? 0 };
}) satisfies PageServerLoad;

export const actions = {
	async deleteCustomer({ params, locals }) {
		const { id } = params;
		const appUser = await AuthUtilities.checkAuth(locals);
		if (appUser.priceManager) {
			const customerService = new CustomerService(appUser);
			const orderService = new OrderService(appUser, customerService);
			const orders = await orderService.getOrdersByCustomerId(id);
			if ((orders?.length ?? 0) === 0) {
				await customerService.deleteCustomerById(id);
			}
		} else {
			throw error(403);
		}

		redirect(303, `/`);
	}
};

import { AuthService } from '$lib/server/service/auth.service';
import { CustomerService } from '$lib/server/service/customer.service';
import { OrderService } from '$lib/server/service/order.service';
import type { PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load = (async ({ params, locals }) => {
	const { id } = params;
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session?.user);
	if (!appUser) throw redirect(303, '/auth/signin');
	const customerService = new CustomerService(appUser);
	const customer = customerService.getCustomerById(id);
	return { customer };
}) satisfies PageServerLoad;

export const actions = {
	async createOrder({ params, locals }) {
		const session = await locals.auth();
		const appUser = AuthService.generateUserFromAuth(session?.user);
		if (!appUser) throw redirect(303, '/auth/signin');

		const { id } = params;
		const orderService = new OrderService(appUser);
		const order = await orderService.createOrder(id, session?.user?.name);
		if (!order) {
			return fail(500, { missing: true });
		}

		redirect(303, `/orders/${order.id}`);
	}
};

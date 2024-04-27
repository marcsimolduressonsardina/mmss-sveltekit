import { OrderService } from '$lib/server/service/order.service';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { customerSchema } from '$lib/shared/customer.utilities';
import { zod } from 'sveltekit-superforms/adapters';
import { isOrderTemp } from '$lib/shared/order.utilities';
import { fail, redirect } from '@sveltejs/kit';
import { AuthService } from '$lib/server/service/auth.service';
import { CustomerService } from '$lib/server/service/customer.service';

export const load = (async ({ params, locals }) => {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session?.user);
	if (!appUser) throw redirect(303, '/auth/signin');
	const { id } = params;
	const orderService = new OrderService(appUser);

	const order = await orderService.getOrderById(id);
	if (!order || !isOrderTemp(order)) {
		return redirect(302, `/`);
	}

	const form = await superValidate(zod(customerSchema));
	return { form };
}) satisfies PageServerLoad;

export const actions = {
	async default({ request, locals, params }) {
		const session = await locals.auth();
		const appUser = AuthService.generateUserFromAuth(session?.user);
		if (!appUser) throw redirect(303, '/auth/signin');

		const { id } = params;
		const orderService = new OrderService(appUser);

		const order = await orderService.getOrderById(id);
		if (!order || !isOrderTemp(order)) {
			return fail(404, { missing: true });
		}

		const form = await superValidate(request, zod(customerSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const customerService = new CustomerService(appUser);
		let customer = undefined;
		customer = await customerService.getCustomerByPhone(form.data.phone);
		if (customer != null) {
			await orderService.addCustomerToTemporaryOrder(customer, order);
		} else {
			customer = await customerService.createCustomer(form.data.name, form.data.phone);
			await orderService.addCustomerToTemporaryOrder(customer, order);
		}

		return redirect(302, `/orders/${id}`);
	}
};

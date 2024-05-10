import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import { CustomerService } from '$lib/server/service/customer.service';
import { OrderService } from '$lib/server/service/order.service';
import { OrderUtilites } from '$lib/shared/order.utilities';
import { AuthUtilities } from '$lib/shared/auth.utilites';

const schema = z.object({
	id: z.string().min(15).includes('/').includes('/')
});

export const load = async ({ locals }) => {
	await AuthUtilities.checkAuth(locals);

	const form = await superValidate(zod(schema));
	return { form };
};

export const actions = {
	async default({ request, locals }) {
		const appUser = await AuthUtilities.checkAuth(locals);

		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			// Again, return { form } and things will just work.
			return fail(400, { form });
		}

		const splits = form.data.id.split('/');
		console.log(splits);
		if (splits.length !== 3) {
			return setError(form, 'id', 'Invalid ID format');
		}

		const customerService = new CustomerService(appUser);
		const existingCustomer = await customerService.getCustomerByPhone(`+${splits[2]}`);
		console.log(existingCustomer);
		if (existingCustomer == null) {
			return setError(form, 'id', 'Invalid ID format');
		}

		const orderService = new OrderService(appUser, customerService);
		const orders = await orderService.getOrdersByCustomerId(existingCustomer.id);
		if (orders == null) {
			return setError(form, 'id', 'Invalid ID format');
		}

		const filteredOrders = orders.filter(
			(order) => OrderUtilites.getOrderPublicId(order) === form.data.id
		);
		if (filteredOrders.length === 0) {
			return setError(form, 'id', 'Order not found');
		}

		return redirect(303, `/orders/${filteredOrders[0].id}`);
	}
};

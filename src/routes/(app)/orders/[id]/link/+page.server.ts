import { OrderService } from '$lib/server/service/order.service';
import { superValidate, setError } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { linkCustomerSchema } from '$lib/shared/customer.utilities';
import { zod } from 'sveltekit-superforms/adapters';
import { isOrderTemp } from '$lib/shared/order.utilities';
import { fail, redirect } from '@sveltejs/kit';
import { CustomerService } from '$lib/server/service/customer.service';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { OrderStatus } from '$lib/type/order.type';
import { CalculatedItemService } from '$lib/server/service/calculated-item.service';

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const orderService = new OrderService(appUser);
	const calculatedItemService = new CalculatedItemService();

	const order = await orderService.getOrderById(id);
	const calculatedItem = await calculatedItemService.getCalculatedItem(id);
	if (order == null || calculatedItem == null) {
		return redirect(302, `/`);
	}

	if (!isOrderTemp(order)) {
		return redirect(302, `/orders/${id}`);
	}

	const form = await superValidate(zod(linkCustomerSchema));
	return {
		form,
		orderName: order.status === OrderStatus.QUOTE ? 'presupuesto' : 'pedido',
		order,
		calculatedItem
	};
}) satisfies PageServerLoad;

export const actions = {
	async default({ request, locals, params }) {
		const appUser = await AuthUtilities.checkAuth(locals);

		const { id } = params;
		const orderService = new OrderService(appUser);

		const order = await orderService.getOrderById(id);
		if (!order || !isOrderTemp(order)) {
			return fail(404, { missing: true });
		}

		const form = await superValidate(request, zod(linkCustomerSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const customerService = new CustomerService(appUser);
		let customer = undefined;
		customer = await customerService.getCustomerByPhone(form.data.phone);
		if (customer != null) {
			await orderService.addCustomerToTemporaryOrder(customer, order);
		} else {
			if (form.data.name != null && (form.data.name as unknown as string).length >= 3) {
				customer = await customerService.createCustomer(form.data.name!, form.data.phone);
				await orderService.addCustomerToTemporaryOrder(customer, order);
			} else {
				return setError(form, 'name', 'Name required');
			}
		}

		return redirect(302, `/orders/${id}`);
	}
};

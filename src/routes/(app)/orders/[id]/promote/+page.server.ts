import { OrderService } from '$lib/server/service/order.service';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { promoteOrderSchema } from '$lib/shared/order.utilities';
import { fail, redirect } from '@sveltejs/kit';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { OrderStatus } from '$lib/type/order.type';

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const orderService = new OrderService(appUser);

	const order = await orderService.getOrderById(id);
	if (!order) {
		return redirect(302, `/`);
	}

	if (order.status !== OrderStatus.QUOTE) {
		return redirect(302, `/orders/${id}`);
	}

	const form = await superValidate(zod(promoteOrderSchema));
	return { form };
}) satisfies PageServerLoad;

export const actions = {
	async default({ request, locals, params }) {
		const appUser = await AuthUtilities.checkAuth(locals);

		const { id } = params;
		const orderService = new OrderService(appUser);

		const order = await orderService.getOrderById(id);
		if (!order || order.status !== OrderStatus.QUOTE) {
			return fail(404, { missing: true });
		}

		const form = await superValidate(request, zod(promoteOrderSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		await orderService.moveQuoteToOrder(order, form.data.deliveryDate);
		return redirect(302, `/orders/${id}`);
	}
};

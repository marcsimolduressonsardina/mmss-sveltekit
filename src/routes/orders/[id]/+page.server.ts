import { AuthService } from '$lib/server/service/auth.service';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { OrderService } from '$lib/server/service/order.service';
import { ItemService } from '$lib/server/service/item.service';

export const load = (async ({ params, locals }) => {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session?.user);
	if (!appUser) throw redirect(303, '/auth/signin');
	const { id } = params;
	const orderService = new OrderService(appUser);
	const itemService = new ItemService(appUser, orderService);

	return { order: orderService.getOrderById(id), items: itemService.getItemsByOrderId(id) };
}) satisfies PageServerLoad;

export const actions = {
	async deleteItem({ params, locals, request }) {
		const session = await locals.auth();
		const appUser = AuthService.generateUserFromAuth(session?.user);
		if (!appUser) throw redirect(303, '/auth/signin');

		const data = await request.formData();
		const itemId = data.get('itemId');

		const { id } = params;
		const orderService = new OrderService(appUser);
		const itemService = new ItemService(appUser, orderService);

		const item = await itemService.getItemByOrderIdAndId(id, itemId!.toString());
		if (!item) {
			return fail(500, { missing: true });
		}

		await itemService.deleteItem(item.itemInfo);
		redirect(303, `/orders/${id}`);
	},
	async deleteOrder({ params, locals }) {
		const session = await locals.auth();
		const appUser = AuthService.generateUserFromAuth(session?.user);
		if (!appUser) throw redirect(303, '/auth/signin');
		const { id } = params;
		const orderService = new OrderService(appUser);

		const order = await orderService.getOrderById(id);
		if (!order) {
			return fail(500, { missing: true });
		}

		await orderService.deleteOrder(order);
		redirect(303, `/customers/${order.customer.id}/`);
	}
};

import { AuthService } from '$lib/server/service/auth.service';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { OrderService } from '$lib/server/service/order.service';

export const load = (async ({ params, locals }) => {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session?.user);
	if (!appUser) throw redirect(303, '/auth/signin');
	const { id } = params;
	const orderService = new OrderService(appUser);
	const order = await orderService.getOrderById(id);
	if (order == null) {
		throw redirect(303, '/');
	}

	return { orders: orderService.getOrdersOnSameDay(order) };
}) satisfies PageServerLoad;

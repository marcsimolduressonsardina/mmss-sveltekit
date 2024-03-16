import { AuthService } from '$lib/server/service/auth.service';
import { OrderService } from '$lib/server/service/order.service';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session?.user);
	if (!appUser) throw redirect(303, '/auth/signin');
	const { id } = params;
	const orderService = new OrderService(appUser);
	return { orders: orderService.getOrdersByCustomerId(id) };
}) satisfies PageServerLoad;

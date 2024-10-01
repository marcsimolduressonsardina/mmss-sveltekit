import { AuthService } from '$lib/server/service/auth.service';
import { OrderService } from '$lib/server/service/order.service.js';
import type { CustomSession } from '$lib/type/api.type';
import { json } from '@sveltejs/kit';
import { OrderStatus } from '$lib/type/order.type';

export async function POST({ request, locals }) {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session as CustomSession);
	if (!appUser) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const orderService = new OrderService(appUser);
	const { query, status } = (await request.json()) as { query: string; status: OrderStatus };
	const orders = await orderService.findOrdersByStatus(status, query);
	return json({ results: orders });
}

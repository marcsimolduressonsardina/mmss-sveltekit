import { AuthService } from '$lib/server/service/auth.service';
import { OrderService } from '$lib/server/service/order.service.js';
import type { CustomSession } from '$lib/type/api.type';
import { json } from '@sveltejs/kit';

export async function GET({ locals, params }) {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session as CustomSession);
	if (!appUser) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id } = params;
	const orderService = new OrderService(appUser);
	const order = await orderService.getOrderById(id);
	if (order == null) {
		return json({ error: 'Order not found' }, { status: 404 });
	}

	await orderService.setOrderAsNotified(order);
	return json({ success: true });
}

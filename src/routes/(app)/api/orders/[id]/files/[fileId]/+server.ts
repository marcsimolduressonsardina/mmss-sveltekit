import { AuthService } from '$lib/server/service/auth.service';
import { FileService } from '$lib/server/service/file.service.js';
import { OrderService } from '$lib/server/service/order.service.js';
import type { CustomSession } from '$lib/type/api.type';
import { json } from '@sveltejs/kit';

const fileService = new FileService();

export async function DELETE({ locals, params }) {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session as CustomSession);
	if (!appUser) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id, fileId } = params;
	const orderService = new OrderService(appUser);
	const order = await orderService.getOrderById(id);
	if (order == null) {
		return json({ error: 'Order not found' }, { status: 404 });
	}

	await fileService.deleteFile(id, fileId);
	return json({ result: 'Deleted' }, { status: 200 });
}

export async function GET({ locals, params }) {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session as CustomSession);
	if (!appUser) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id, fileId } = params;
	const orderService = new OrderService(appUser);
	const order = await orderService.getOrderById(id);
	if (order == null) {
		return json({ error: 'Order not found' }, { status: 404 });
	}

	const file = await fileService.getFile(id, fileId);
	if (file == null) {
		return json({ error: 'File not found' }, { status: 404 });
	}

	return json(file);
}

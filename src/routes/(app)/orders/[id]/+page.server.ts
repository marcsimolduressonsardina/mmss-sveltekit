import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, RouteParams } from './$types';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import {
	CalculatedItemService,
	FileService,
	OrderService,
	OrderStatus,
	type AppUser,
	type CalculatedItem,
	type ISameDayOrderCounters,
	type Order
} from '@marcsimolduressonsardina/core';
import { AuthService } from '$lib/server/service/auth.service';

async function setOrderStatus(
	status: OrderStatus,
	params: RouteParams,
	locals: App.Locals
): Promise<Order> {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;

	if (!appUser.priceManager && status === OrderStatus.DELETED) {
		throw fail(403, {});
	}

	const orderService = new OrderService(AuthService.generateConfiguration(appUser));

	const order = await orderService.getOrderById(id);
	if (!order) {
		throw fail(500, { missing: true });
	}

	await orderService.setOrderStatus(order, status);
	return order;
}

async function loadData(
	user: AppUser,
	orderId: string
): Promise<{
	order: Order | null;
	unfinishedSameDayCount: ISameDayOrderCounters;
	calculatedItem: CalculatedItem | null;
	hasFiles: boolean;
}> {
	const config = AuthService.generateConfiguration(user);
	const orderService = new OrderService(config);
	const calculatedItemService = new CalculatedItemService(config);
	const fileService = new FileService(config);
	const order = await orderService.getOrderById(orderId);
	const calculatedItem = await calculatedItemService.getCalculatedItem(orderId);
	const files = await fileService.getFilesByOrder(orderId);
	const unfinishedSameDayCount = order
		? await orderService.getOrdersCountOnSameDay(order)
		: { finishedCount: 0, pendingCount: 0, totalCount: 1 };
	return { order, calculatedItem, hasFiles: files.length > 0, unfinishedSameDayCount };
}

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	return {
		info: loadData(appUser, id),
		isPriceManager: appUser.priceManager
	};
}) satisfies PageServerLoad;

export const actions = {
	async deleteOrder({ params, locals }) {
		await setOrderStatus(OrderStatus.DELETED, params, locals);
		redirect(303, `/`);
	}
};

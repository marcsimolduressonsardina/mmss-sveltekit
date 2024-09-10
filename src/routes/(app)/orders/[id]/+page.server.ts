import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, RouteParams } from './$types';
import { OrderService } from '$lib/server/service/order.service';
import { CalculatedItemService } from '$lib/server/service/calculated-item.service';
import { OrderStatus, PaymentStatus } from '$lib/type/order.type';
import type { AppUser, Order } from '$lib/type/api.type';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import type { CalculatedItem } from '../../../../lib/type/api.type';
import { FileService } from '$lib/server/service/file.service';

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

	const orderService = new OrderService(appUser);

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
): Promise<{ order: Order | null; calculatedItem: CalculatedItem | null; hasFiles: boolean }> {
	const orderService = new OrderService(user);
	const calculatedItemService = new CalculatedItemService();
	const fileService = new FileService();
	const order = await orderService.getOrderById(orderId);
	const calculatedItem = await calculatedItemService.getCalculatedItem(orderId);
	const files = await fileService.getFilesByOrder(orderId);
	return { order, calculatedItem, hasFiles: files.length > 0 };
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
	},
	async changeOrderStatus({ request, locals, params }) {
		const formData = await request.formData();
		const newStatus = formData.get('status') as OrderStatus;
		return await setOrderStatus(newStatus, params, locals);
	},
	async changePayment({ request, locals, params }) {
		const formData = await request.formData();
		const newStatus = formData.get('paymentStatus') as PaymentStatus;
		const amount = formData.get('amount')?.toString();

		const appUser = await AuthUtilities.checkAuth(locals);
		const { id } = params;
		const orderService = new OrderService(appUser);

		const order = await orderService.getOrderById(id);
		if (!order) {
			return fail(500, { missing: true });
		}

		if (newStatus === PaymentStatus.FULLY_PAID) {
			await orderService.setOrderFullyPaid(order);
		}

		if (newStatus === PaymentStatus.UNPAID) {
			await orderService.setOrderPartiallyPaid(order, 0);
		}

		if (newStatus === PaymentStatus.PARTIALLY_PAID) {
			if (amount == null) {
				return fail(400, { missing: true });
			}
			const amountNumber = parseFloat(amount);
			if (isNaN(amountNumber) || amountNumber < 0) {
				return fail(400, { invalid: true });
			}

			await orderService.setOrderPartiallyPaid(order, amountNumber);
		}
	}
};

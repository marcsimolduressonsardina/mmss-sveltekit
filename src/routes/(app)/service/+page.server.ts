import { QR_HOST } from '$env/static/private';
import type { PageServerLoad } from './$types';
import { OrderService } from '$lib/server/service/order.service';
import { CalculatedItemService } from '$lib/server/service/calculated-item.service';
import { redirect } from '@sveltejs/kit';
import type { AppUser } from '$lib/type/api.type';
import { CustomerService } from '$lib/server/service/customer.service';
import { OrderUtilites } from '$lib/shared/order.utilities';

export const load = (async ({ url }) => {
	const orderParam = url.searchParams.get('order');
	if (orderParam == null) {
		throw redirect(303, 'https://marcsimoldures.com/');
	}

	const orderData = OrderService.restoreOrderPublicParam(orderParam);
	const tempUser: AppUser = {
		id: 'temp',
		storeId: orderData['storeId'],
		name: 'temp'
	};

	const customerService = new CustomerService(tempUser);
	const orderService = new OrderService(tempUser, customerService);
	const calculatedItemService = new CalculatedItemService();

	const splits = orderData['publicId'].split('/');
	if (splits.length !== 3) {
		throw redirect(303, 'https://marcsimoldures.com/');
	}

	const existingCustomer = await customerService.getCustomerByPhone(`+${splits[2]}`);
	if (existingCustomer == null) {
		throw redirect(303, 'https://marcsimoldures.com/');
	}

	const orders = await orderService.getOrdersByCustomerId(existingCustomer.id);
	if (orders == null) {
		throw redirect(303, 'https://marcsimoldures.com/');
	}

	const filteredOrders = orders.filter(
		(order) => OrderUtilites.getOrderPublicId(order) === orderData['publicId']
	);

	if (filteredOrders.length === 0) {
		throw redirect(303, 'https://marcsimoldures.com/');
	}

	return {
		order: filteredOrders[0],
		calculatedItem: await calculatedItemService.getCalculatedItem(filteredOrders[0].id),
		qrHost: QR_HOST
	};
}) satisfies PageServerLoad;

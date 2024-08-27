import { OrderService } from '$lib/server/service/order.service';
import type { PageServerLoad } from './$types';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { CustomerService } from '$lib/server/service/customer.service';
import { OrderStatus } from '$lib/type/order.type';

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const customerService = new CustomerService(appUser);
	const orderService = new OrderService(appUser, customerService);
	const customer = await customerService.getCustomerById(id);
	return { orders: orderService.getOrdersByCustomerIdAndStatus(id, OrderStatus.QUOTE), customer };
}) satisfies PageServerLoad;

import type { PageServerLoad } from './$types';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { AuthService } from '$lib/server/service/auth.service';
import { CustomerService, OrderService } from '@marcsimolduressonsardina/core';

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const config = AuthService.generateConfiguration(appUser);
	const customerService = new CustomerService(config);
	const orderService = new OrderService(config, customerService);
	const customer = await customerService.getCustomerById(id);
	return { orders: orderService.getOrdersByCustomerId(id), customer };
}) satisfies PageServerLoad;

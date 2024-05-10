import { CustomerService } from '$lib/server/service/customer.service';
import { AuthUtilities } from '$lib/shared/auth.utilites';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
	const { id } = params;
	const appUser = await AuthUtilities.checkAuth(locals);
	const customerService = new CustomerService(appUser);
	const customer = customerService.getCustomerById(id);
	return { customer };
}) satisfies PageServerLoad;

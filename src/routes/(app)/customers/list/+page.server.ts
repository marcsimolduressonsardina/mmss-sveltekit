import { CustomerService } from '$lib/server/service/customer.service';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const customerService = new CustomerService(appUser);
	const customers = customerService.getAllCustomersMap().then((m) => Array.from(m.values()));

	return { customers };
}) satisfies PageServerLoad;

import { CustomerService } from '$lib/server/service/customer.service';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	if (!appUser.priceManager) {
		throw error(403);
	}
	const customerService = new CustomerService(appUser);
	await customerService.indexCustomers();

	return { result: true };
}) satisfies PageServerLoad;

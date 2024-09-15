import { CustomerService } from '$lib/server/service/customer.service';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals, url }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const searchQuery = url.searchParams.get('query') ?? undefined;
	const linkOrderId = url.searchParams.get('linkOrderId') ?? undefined;
	if (searchQuery == null) {
		throw error(400);
	}

	const decodedSearchQuery = atob(searchQuery);
	const customerService = new CustomerService(appUser);
	const customers = customerService.searchCustomers(decodedSearchQuery);
	return { customers, decodedSearchQuery, linkOrderId };
}) satisfies PageServerLoad;

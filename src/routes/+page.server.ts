import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { CustomerService } from '$lib/server/service/customer.service';
import { AuthService } from '$lib/server/service/auth.service';

export const load = (async ({ locals }) => {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session?.user);
	if (!appUser) throw redirect(303, '/auth/signin');
	const customerService = new CustomerService(appUser);
	const customer = await customerService.getCustomerById('74645110-ab47-490d-b95f-b77677759609');
	return { customer };
}) satisfies PageServerLoad;

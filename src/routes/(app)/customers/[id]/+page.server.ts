import { AuthService } from '$lib/server/service/auth.service';
import { CustomerService } from '$lib/server/service/customer.service';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ params, locals }) => {
	const { id } = params;
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session?.user);
	if (!appUser) throw redirect(303, '/auth/signin');
	const customerService = new CustomerService(appUser);
	const customer = customerService.getCustomerById(id);
	return { customer };
}) satisfies PageServerLoad;



import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import { CustomerService } from '$lib/server/service/customer.service';
import { AuthService } from '$lib/server/service/auth.service';

const schema = z.object({
	name: z.string().min(3).default(''),
	phone: z.string().min(9).default('+34')
});

export const load = async ({ url, locals }) => {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session?.user);
	if (!appUser) throw redirect(303, '/auth/signin');

	const phone = url.searchParams.get('phone');
	const form = await superValidate(zod(schema));
	if (phone) form.data.phone = phone;
	return { form };
};

export const actions = {
	async default({ request, locals }) {
		const session = await locals.auth();
		const appUser = AuthService.generateUserFromAuth(session?.user);
		if (!appUser) throw redirect(303, '/auth/signin');

		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			// Again, return { form } and things will just work.
			return fail(400, { form });
		}

		const customerService = new CustomerService(appUser);
		const existingCustomer = await customerService.getCustomerByPhone(form.data.phone);
		if (existingCustomer) {
			return redirect(302, `/customers/${existingCustomer.id}`);
		}

		const customer = await customerService.createCustomer(form.data.name, form.data.phone);
		if (customer == null) {
			return error(500, 'Error creating customer');
		}

		return redirect(302, `/customers/${customer.id}`);
	}
};

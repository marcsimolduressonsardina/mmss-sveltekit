import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { AuthService } from '$lib/server/service/auth.service';
import { PricingService } from '$lib/server/service/pricing.service.js';
import { listPriceSchemaNew } from '$lib/shared/pricing.utilites';

export const load = async ({ locals }) => {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session?.user);
	if (!appUser) throw redirect(303, '/auth/signin');

	const form = await superValidate(zod(listPriceSchemaNew));
	return { form };
};

export const actions = {
	async default({ request, locals }) {
		const session = await locals.auth();
		const appUser = AuthService.generateUserFromAuth(session?.user);
		if (!appUser) throw redirect(303, '/auth/signin');

		const form = await superValidate(request, zod(listPriceSchemaNew));
		if (!form.valid) {
			return fail(400, { form });
		}

		const pricingService = new PricingService();
		try {
			await pricingService.createPricing(
				form.data.id,
				form.data.price,
				form.data.description,
				form.data.type,
				form.data.formula,
				form.data.areas,
				form.data.isDefault,
				form.data.maxD1,
				form.data.maxD2
			);
		} catch (error: unknown) {
			return setError(form, '', 'Error creando el item. Intente de nuevo.');
		}

		return redirect(302, `/prices`);
	}
};

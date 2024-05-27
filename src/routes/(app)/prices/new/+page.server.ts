import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { PricingService } from '$lib/server/service/pricing.service.js';
import { listPriceSchemaNew } from '$lib/shared/pricing.utilites';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { PricingFormula } from '$lib/type/pricing.type.js';

export const load = async ({ locals }) => {
	await AuthUtilities.checkAuth(locals, true);
	const form = await superValidate(zod(listPriceSchemaNew));
	return { form };
};

export const actions = {
	async createOrEdit({ request, locals }) {
		await AuthUtilities.checkAuth(locals, true);

		const form = await superValidate(request, zod(listPriceSchemaNew));
		console.log(form.errors);
		if (!form.valid) {
			return fail(400, { form });
		}

		const pricingService = new PricingService();
		try {
			const areas = form.data.formula === PricingFormula.FORMULA_FIT_AREA ? form.data.areas : [];
			const price = form.data.formula === PricingFormula.FORMULA_FIT_AREA ? 0 : form.data.price;
			const maxD1 =
				form.data.formula === PricingFormula.FORMULA_FIT_AREA ? undefined : form.data.maxD1;
			const maxD2 =
				form.data.formula === PricingFormula.FORMULA_FIT_AREA ? undefined : form.data.maxD2;

			await pricingService.createPricing(
				form.data.id,
				price,
				form.data.description,
				form.data.type,
				form.data.formula,
				areas,
				form.data.priority,
				maxD1,
				maxD2
			);
		} catch (error: unknown) {
			return setError(form, '', 'Error creando el item. Intente de nuevo.');
		}

		return redirect(302, `/prices/list?type=${form.data.type}`);
	}
};

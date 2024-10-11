import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { listPriceSchemaNew } from '$lib/shared/pricing.utilites';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import {
	PricingService,
	PricingUtilites,
	type MaxArea,
	type MaxAreaM2,
	type PricingFormula,
	type PricingType
} from '@marcsimolduressonsardina/core';
import { AuthService } from '$lib/server/service/auth.service.js';

export const load = async ({ locals }) => {
	await AuthUtilities.checkAuth(locals, true);
	const form = await superValidate(zod(listPriceSchemaNew));
	return { form };
};

export const actions = {
	async createOrEdit({ request, locals }) {
		const appUser = await AuthUtilities.checkAuth(locals, true);

		const form = await superValidate(request, zod(listPriceSchemaNew));
		if (!form.valid) {
			return fail(400, { form });
		}

		const pricingService = new PricingService(AuthService.generateConfiguration(appUser));
		try {
			const { price, maxD1, maxD2, areas, areasM2 } = PricingUtilites.cleanFormValues(
				form as unknown as {
					data: {
						formula: PricingFormula;
						areas: MaxArea[];
						areasM2: MaxAreaM2[];
						price: number;
						maxD1: number;
						maxD2: number;
					};
				}
			);

			await pricingService.createPricing(
				form.data.id,
				price,
				form.data.minPrice,
				form.data.discountAllowed,
				form.data.description,
				form.data.type as PricingType,
				form.data.formula,
				areas,
				areasM2,
				form.data.priority,
				maxD1,
				maxD2
			);
		} catch (error: unknown) {
			return setError(form, '', 'Error creando el item. Intente de nuevo.');
		}

		return redirect(302, `/config/prices/list?type=${form.data.type}`);
	}
};

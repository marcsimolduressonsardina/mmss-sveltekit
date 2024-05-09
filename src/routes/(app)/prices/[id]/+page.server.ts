import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { PricingService } from '$lib/server/service/pricing.service.js';
import { listPriceSchemaEdit, type EditablePricingTypes } from '$lib/shared/pricing.utilites';
import type { ListPrice } from '$lib/type/api.type.js';
import { AuthUtilities } from '$lib/shared/auth.utilites';

async function getListPrice(id: string): Promise<ListPrice> {
	if (id == null) throw fail(400);
	const pricingService = new PricingService();
	const pricing = await pricingService.getPriceListByInternalId(id);
	if (pricing == null) throw fail(404);
	return pricing;
}

export const load = async ({ locals, params }) => {
	await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const listPrice = await getListPrice(id);
	const form = await superValidate(zod(listPriceSchemaEdit));
	form.data.id = listPrice.id;
	form.data.price = listPrice.price;
	form.data.description = listPrice.description;
	form.data.type = listPrice.type as EditablePricingTypes;
	form.data.formula = listPrice.formula;
	form.data.areas = listPrice.areas;
	form.data.maxD1 = listPrice.maxD1;
	form.data.maxD2 = listPrice.maxD2;
	form.data.isDefault = listPrice.isDefault;
	return { form };
};

export const actions = {
	async default({ request, locals, params }) {
		await AuthUtilities.checkAuth(locals);

		const form = await superValidate(request, zod(listPriceSchemaEdit));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { id } = params;
		const listPrice = await getListPrice(id);
		const pricingService = new PricingService();
		try {
			listPrice.price = form.data.price;
			listPrice.description = form.data.description;
			listPrice.type = form.data.type;
			listPrice.formula = form.data.formula;
			listPrice.areas = form.data.areas;
			listPrice.maxD1 = form.data.maxD1;
			listPrice.maxD2 = form.data.maxD2;
			listPrice.isDefault = form.data.isDefault;
			await pricingService.updatePricing(listPrice);
		} catch (error: unknown) {
			return setError(form, '', 'Error actualizando el item. Intente de nuevo.');
		}

		return redirect(302, `/prices`);
	}
};

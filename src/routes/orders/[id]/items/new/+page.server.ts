import { AuthService } from '$lib/server/service/auth.service';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { OrderService } from '$lib/server/service/order.service';
import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate, setError } from 'sveltekit-superforms';
import { PricingProvider } from '../../../../../lib/server/data/pricing.provider';
import { PricingType } from '$lib/type/pricing.type';
import { ItemService } from '$lib/server/service/item.service';
import { InvalidSizeError } from '$lib/server/error/invalid-size.error';

const extraPartSchema = z.object({
	price: z.number().min(0).default(0),
	quantity: z.number().int().min(1).default(1),
	description: z.string().default('')
});

const partToCalculateSchema = z.object({
	id: z.string(),
	quantity: z.number().int().min(1).default(1),
	type: z.enum([
		PricingType.MOLD,
		PricingType.GLASS,
		PricingType.PP,
		PricingType.BACK,
		PricingType.OTHER,
		PricingType.FABRIC
	])
});

const itemSchema = z.object({
	width: z.number().min(1.0),
	height: z.number().min(1.0),
	deliveryDate: z.date().min(new Date()),
	description: z.string().default(''),
	observations: z.string().default(''),
	quantity: z.number().int().min(1).default(1),
	passePartoutWidth: z.number().min(0).default(0).optional(),
	passePartoutHeight: z.number().min(0).default(0).optional(),
	discount: z.number().min(0).default(0),
	extraParts: z.array(extraPartSchema),
	partsToCalculate: z.array(partToCalculateSchema),
	extraObservations: z.array(z.string()).default([])
});

async function getPricing() {
	const pricingProvider = new PricingProvider();
	const moldPricesPromise = pricingProvider.getPricingList(PricingType.MOLD);
	const glassPromise = pricingProvider.getPricingList(PricingType.GLASS);
	const ppPricesPromise = pricingProvider.getPricingList(PricingType.PP);
	const backPricesPromise = pricingProvider.getPricingList(PricingType.BACK);
	const otherPricesPromise = pricingProvider.getPricingList(PricingType.OTHER);
	const [moldPrices, glassPrices, ppPrices, backPrices, otherPrices] = await Promise.all([
		moldPricesPromise,
		glassPromise,
		ppPricesPromise,
		backPricesPromise,
		otherPricesPromise
	]);
	return { moldPrices, glassPrices, ppPrices, backPrices, otherPrices };
}

export const load = (async ({ params, locals }) => {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session?.user);
	if (!appUser) throw redirect(303, '/auth/signin');
	const { id } = params;
	const orderService = new OrderService(appUser);
	const form = await superValidate(zod(itemSchema));
	const pricing = await getPricing();

	return { order: orderService.getOrderById(id), form, pricing, errorMessage: 'gg' };
}) satisfies PageServerLoad;

export const actions = {
	async default({ params, request, locals }) {
		const { id } = params;
		const session = await locals.auth();
		const appUser = AuthService.generateUserFromAuth(session?.user);
		if (!appUser) throw redirect(303, '/auth/signin');

		const form = await superValidate(request, zod(itemSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const itemService = new ItemService(appUser);
		const partsToCalculate = form.data.partsToCalculate.map((part) => ({
			id: part.id,
			quantity: part.quantity,
			type: part.type as PricingType
		}));

		const observations = form.data.extraObservations.reduce(
			(acc, obs) => `${acc}${obs}\n`,
			form.data.observations === '' ? '' : `${form.data.observations}\n`
		);

		try {
			const itemData = await itemService.createItem(
				id,
				form.data.width,
				form.data.height,
				form.data.passePartoutWidth ?? 0,
				form.data.passePartoutHeight ?? 0,
				form.data.description,
				observations,
				form.data.quantity,
				form.data.deliveryDate,
				partsToCalculate,
				form.data.extraParts,
				form.data.discount
			);

			if (!itemData) {
				return setError(form, '', 'Error creando el item. Intente de nuevo.');
			}

			await itemService.saveItem(itemData.itemInfo, itemData.calculatedItem);
		} catch (error: unknown) {
			console.log(error);
			if (error instanceof InvalidSizeError) {
				return setError(form, '', error.message);
			}

			return setError(form, '', 'Error creando el item. Intente de nuevo.');
		}

		return redirect(302, `/orders/${id}`);
	}
};

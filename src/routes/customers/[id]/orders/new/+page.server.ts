import { AuthService } from '$lib/server/service/auth.service';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { OrderService } from '$lib/server/service/order.service';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate, setError } from 'sveltekit-superforms';
import { PricingType } from '$lib/type/pricing.type';
import { InvalidSizeError } from '$lib/server/error/invalid-size.error';
import { PricingHelper } from '$lib/server/shared/pricing/pricing.helper';
import { itemSchema } from '$lib/shared/order.utilities';

export const load = (async ({ locals }) => {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session?.user);
	if (!appUser) throw redirect(303, '/auth/signin');
	const form = await superValidate(zod(itemSchema));
	const pricing = PricingHelper.getPricing();

	return { form, pricing };
}) satisfies PageServerLoad;

export const actions = {
	async default({ request, locals, params }) {
		const session = await locals.auth();
		const appUser = AuthService.generateUserFromAuth(session?.user);
		if (!appUser) throw redirect(303, '/auth/signin');

		const form = await superValidate(request, zod(itemSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { id } = params;
		const orderService = new OrderService(appUser);
		const partsToCalculate = form.data.partsToCalculate.map((part) => ({
			id: part.id,
			quantity: part.quantity,
			type: part.type as PricingType
		}));

		try {
			const order = await orderService.createOrderForCustomer(
				id,
				form.data.width,
				form.data.height,
				form.data.passePartoutWidth ?? 0,
				form.data.passePartoutHeight ?? 0,
				form.data.description,
				form.data.predefinedObservations,
				form.data.observations,
				form.data.quantity,
				form.data.deliveryDate,
				partsToCalculate,
				form.data.extraParts,
				form.data.discount,
				session?.user?.name
			);

			if (!order) {
				return setError(form, '', 'Error creando el pedido. Intente de nuevo.');
			}

			return redirect(302, `/orders/${order.id}`);
		} catch (error: unknown) {
			console.log(error);
			if (error instanceof InvalidSizeError) {
				return setError(form, '', error.message);
			}

			return setError(form, '', 'Error creando el pedido. Intente de nuevo.');
		}
	}
};

import type { OrderCreationDto } from '$lib/server/service/dto/order-creation.dto';
import { orderSchema, quoteSchema } from '$lib/shared/order.utilities';
import type { Order } from '$lib/type/api.type';
import { setError, superValidate, type SuperValidated } from 'sveltekit-superforms';
import { OrderService } from '../../service/order.service';
import { z } from 'zod';
import type { PricingType } from '$lib/type/pricing.type';
import { DateTime } from 'luxon';
import { zod } from 'sveltekit-superforms/adapters';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { fail, redirect } from '@sveltejs/kit';
import { InvalidSizeError } from '$lib/server/error/invalid-size.error';
import { PricingHelper } from '../pricing/pricing.helper';

type OrderTypeForm = z.infer<typeof orderSchema>;
type QuoteTypeForm = z.infer<typeof quoteSchema>;

export class OrderCreationUtilities {
	static async createOrderFromForm(
		form: SuperValidated<OrderTypeForm | QuoteTypeForm>,
		orderService: OrderService,
		isQuote: boolean,
		customerId?: string
	): Promise<Order | null> {
		const partsToCalculate = form.data.partsToCalculate.map((part) => ({
			id: part.id,
			quantity: part.quantity,
			type: part.type as PricingType,
			moldId: part.moldId,
			extraInfo: part.extraInfo
		}));

		const deliveryDate = isQuote
			? DateTime.fromFormat('31/12/9999', 'dd/MM/yyyy').toJSDate()
			: form.data.deliveryDate;
		if (deliveryDate == null) {
			throw Error('Delivery date can not be empty');
		}

		const dto: OrderCreationDto = {
			customerId,
			isQuote,
			width: form.data.width,
			height: form.data.height,
			pp: form.data.pp ?? 0,
			description: form.data.description,
			predefinedObservations: form.data.predefinedObservations,
			observations: form.data.observations,
			quantity: form.data.quantity,
			deliveryDate,
			partsToCalculate: partsToCalculate,
			extraParts: form.data.extraParts,
			discount: form.data.discount,
			hasArrow: form.data.hasArrow,
			ppDimensions: form.data.ppDimensions,
			exteriorWidth: form.data.exteriorWidth,
			exteriorHeight: form.data.exteriorHeight
		};

		return orderService.createOrderFromDto(dto);
	}

	static async handleCreateOrderFormPage(locals: App.Locals) {
		await AuthUtilities.checkAuth(locals);
		const form = await superValidate(zod(orderSchema));
		const pricing = PricingHelper.getPricing();

		return { form, pricing };
	}

	static async handleCreateOrder(
		isQuote: boolean,
		request: Request,
		locals: App.Locals,
		customerId?: string
	) {
		const appUser = await AuthUtilities.checkAuth(locals);
		const schema = isQuote ? quoteSchema : orderSchema;
		const form = await superValidate(request, zod(schema));
		console.log(form.errors);

		if (!form.valid) {
			return fail(400, { form });
		}

		const orderService = new OrderService(appUser);
		let orderId = '';

		try {
			const order = await OrderCreationUtilities.createOrderFromForm(
				form,
				orderService,
				isQuote,
				customerId
			);
			if (order === null) {
				console.log('Error creating quote');
				return setError(form, '', 'Error creando el pedido / presupuesto. Intente de nuevo.');
			}

			orderId = order.id;
		} catch (error: unknown) {
			console.log(error);
			if (error instanceof InvalidSizeError) {
				return setError(form, '', error.message);
			}

			return setError(form, '', 'Error creando el pedido / presupuesto. Intente de nuevo.');
		}

		if (customerId == null) {
			return redirect(302, `/orders/${orderId}/link`);
		} else {
			return redirect(302, `/orders/${orderId}`);
		}
	}
}

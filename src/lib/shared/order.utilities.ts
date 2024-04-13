import type { Order } from '$lib/type/api.type';
import { PricingType } from '$lib/type/pricing.type';
import { z } from 'zod';

export class OrderUtilites {
	public static getOrderPublicId(order: Order): string {
		const date = new Date(order.createdAt);
		const month = date.getMonth() + 1;
		let monthString = '';
		if (month < 10) {
			monthString = `0${month}`;
		} else {
			monthString = `${month}`;
		}

		const phoneWithoutPlus = order.customer.phone.replace('+', '');
		return `${date.getFullYear()}${monthString}${date.getDate()}/${date.getSeconds()}/${phoneWithoutPlus}`;
	}
}

export const tempCustomerUuid = 'temp-customer';

export function isOrderTemp(order: Order): boolean {
	return order.customer.id === tempCustomerUuid;
}

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

const ppDimensionsSchema = z.object({
	up: z.number().min(0),
	down: z.number().min(0),
	left: z.number().min(0),
	right: z.number().min(0)
});

export const itemSchema = z.object({
	width: z.number().min(1.0),
	height: z.number().min(1.0),
	deliveryDate: z.date().min(new Date()),
	description: z.string().default(''),
	observations: z.string().default(''),
	quantity: z.number().int().min(1).default(1),
	pp: z.number().min(0).default(0).optional(),
	ppDimensions: ppDimensionsSchema.optional(),
	discount: z.number().min(0).default(0),
	extraParts: z.array(extraPartSchema),
	partsToCalculate: z.array(partToCalculateSchema),
	predefinedObservations: z.array(z.string()).default([])
});
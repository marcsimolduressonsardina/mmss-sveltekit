import type { CalculatedItem, Order } from '$lib/type/api.type';
import { OrderStatus } from '$lib/type/order.type';
import { PricingType } from '$lib/type/pricing.type';
import { z } from 'zod';
import { CalculatedItemUtilities } from './calculated-item.utilites';

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

	public static getOrderMolds(order: Order): string[] {
		return order.item.partsToCalculate
			.filter((p) => p.type === PricingType.MOLD)
			.map((p) => CalculatedItemUtilities.getMoldDescription(p.id));
	}

	public static getOrderPP(order: Order, calculatedItem: CalculatedItem): string[] {
		const ppIds = order.item.partsToCalculate
			.filter((p) => p.type === PricingType.PP)
			.map((p) => p.id);

		return calculatedItem.parts
			.filter((p) => ppIds.indexOf(p.priceId) > -1)
			.map((p) => p.description);
	}
}

export const tempCustomerUuid = 'temp-customer';

export function isOrderTemp(order: Order): boolean {
	return order.customer.id === tempCustomerUuid;
}

export const orderStatusMap: Record<OrderStatus, string> = {
	[OrderStatus.FINISHED]: 'Finalizado',
	[OrderStatus.PICKED_UP]: 'Recogido',
	[OrderStatus.PENDING]: 'Pendiente',
	[OrderStatus.DELETED]: 'Eliminado'
};

const extraPartSchema = z.object({
	priceId: z.string().default('extra'),
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
		PricingType.LABOUR,
		PricingType.BACK,
		PricingType.OTHER,
		PricingType.FABRIC
	]),
	moldId: z.string().optional()
});

const ppDimensionsSchema = z.object({
	up: z.number().min(0),
	down: z.number().min(0),
	left: z.number().min(0),
	right: z.number().min(0)
});

export const itemSchema = z.object({
	width: z
		.number()
		.min(1.0)
		.default('' as unknown as number),
	height: z
		.number()
		.min(1.0)
		.default('' as unknown as number),
	deliveryDate: z.date().min(new Date()),
	description: z.string().default(''),
	observations: z.string().default(''),
	quantity: z.number().int().min(1).default(1),
	pp: z.number().min(0).default(0).optional().default(0),
	ppDimensions: ppDimensionsSchema.optional(),
	discount: z.number().min(0).default(0),
	extraParts: z.array(extraPartSchema),
	partsToCalculate: z.array(partToCalculateSchema),
	predefinedObservations: z.array(z.string()).default([])
});

export const smsTemplates = {
	orderCreated: 'Su pedido #param1# ha sido creado correctamente. Puede consultarlo en #param2#',
	orderFinished: 'Su pedido #param1# ha sido finalizado. Puede pasar a recogerlo.'
};

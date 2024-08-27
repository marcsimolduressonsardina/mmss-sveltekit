import type {
	CalculatedItemPart,
	Customer,
	PPDimensions,
	PreCalculatedItemPart
} from '$lib/type/api.type';

type OrderCreationDtoBase = {
	width: number;
	height: number;
	pp: number;
	description: string;
	isQuote: boolean;
	predefinedObservations: string[];
	observations: string;
	quantity: number;
	deliveryDate: Date;
	partsToCalculate: PreCalculatedItemPart[];
	extraParts: CalculatedItemPart[];
	discount: number;
	hasArrow: boolean;
	ppDimensions?: PPDimensions;
	exteriorWidth?: number;
	exteriorHeight?: number;
};

export type OrderCreationDto = OrderCreationDtoBase & { customerId?: string };
export type OrderCreationWithCustomerDto = OrderCreationDtoBase & { customer: Customer };

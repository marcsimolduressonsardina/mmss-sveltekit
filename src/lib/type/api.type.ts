import type { PricingType } from './pricing.type';

export type Customer = {
	id: string;
	storeId: string;
	name: string;
	phone: string;
};

export type AppUser = {
	id: string;
	storeId: string;
	name: string;
};

export type CalculatedItemPart = {
	price: number;
	quantity: number;
	description: string;
	log?: string;
};

export type PreCalculatedItemPart = {
	type: PricingType;
	id: string;
	quantity: number;
};

export type PreCalculatedItemPartRequest = {
	partToCalculate: PreCalculatedItemPart;
	width: number;
	height: number;
};

export type ItemResponse = {
	itemInfo: Item;
	calculatedItem: CalculatedItem;
};

export type Order = {
	id: string;
	customer: Customer;
	storeId: string;
	createdAt: Date;
	user: AppUser;
	userName?: string;
	deleted: boolean;
};

export type Item = {
	id: string;
	orderId: string;
	width: number;
	height: number;
	passePartoutWidth: number;
	passePartoutHeight: number;
	description: string;
	predefinedObservations: string[];
	observations: string;
	quantity: number;
	createdAt: Date;
	deliveryDate: Date;
	partsToCalculate: PreCalculatedItemPart[];
	deleted: boolean;
};

export type CalculatedItem = {
	itemId: string;
	discount: number;
	parts: CalculatedItemPart[];
	total: number;
};

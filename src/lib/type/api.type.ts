import type { OrderStatus } from './order.type';
import type { PricingFormula, PricingType } from './pricing.type';

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
	priceId: string;
	price: number;
	quantity: number;
	description: string;
	log?: string;
};

export type PreCalculatedItemPart = {
	type: PricingType;
	id: string;
	quantity: number;
	moldId?: string; // For fabric
};

export type PreCalculatedItemPartRequest = {
	partToCalculate: PreCalculatedItemPart;
	width: number;
	height: number;
};

export type Order = {
	id: string;
	shortId: string;
	customer: Customer;
	storeId: string;
	createdAt: Date;
	user: AppUser;
	userName?: string;
	amountPayed: number;
	item: Item;
	status: OrderStatus;
	statusUpdated: Date;
};

export type OrderFromList = {
	id: string;
	shortId: string;
	customerId: string;
	storeId: string;
	createdAt: Date;
	userId: string;
	userName?: string;
	amountPayed: number;
	item: Item;
	status: OrderStatus;
	statusUpdated: Date;
};

export type PPDimensions = {
	up: number;
	down: number;
	left: number;
	right: number;
};

export type Item = {
	width: number;
	height: number;
	pp: number;
	ppDimensions?: PPDimensions;
	description: string;
	predefinedObservations: string[];
	observations: string;
	quantity: number;
	createdAt: Date;
	deliveryDate: Date;
	partsToCalculate: PreCalculatedItemPart[];
};

export type CalculatedItem = {
	orderId: string;
	discount: number;
	parts: CalculatedItemPart[];
	total: number;
	quantity: number;
};

export type MaxArea = {
	d1: number;
	d2: number;
	price: number;
};

export type ListPrice = {
	id: string;
	internalId: string;
	price: number;
	description: string;
	type: PricingType;
	formula: PricingFormula;
	areas: MaxArea[];
	isDefault: boolean;
	maxD1?: number;
	maxD2?: number;
};

import type { OrderStatus } from './order.type';
import type { Session } from '@auth/core/types';
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
	priceManager: boolean;
};

export type StaticUser = {
	id: string;
	storeId: string;
	name: string;
	priceManager: boolean;
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

type OrderBase = {
	id: string;
	shortId: string;
	storeId: string;
	createdAt: Date;
	userName: string;
	amountPayed: number;
	item: Item;
	status: OrderStatus;
	statusUpdated: Date;
	hasArrow: boolean;
};

export type Order = OrderBase & {
	customer: Customer;
	user: AppUser | StaticUser;
};

export type OrderFromList = OrderBase & {
	customerId: string;
	userId: string;
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
	exteriorWidth?: number;
	exteriorHeight?: number;
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
	priority: number;
	maxD1?: number;
	maxD2?: number;
};

export type UserMetadata = {
	priceManager?: boolean;
	storeId?: string;
};

export type WithMetadata = {
	userMetadata: UserMetadata;
};

export type CustomSession = WithMetadata & Session;

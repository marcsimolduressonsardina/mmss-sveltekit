import type { OrderDimensions, OrderStatus } from './order.type';
import type { Session } from '@auth/core/types';
import type { PricingFormula, PricingType } from './pricing.type';

export type Customer = {
	id: string;
	storeId: string;
	name: string;
	phone: string;
};

export interface StaticUser {
	id: string;
	storeId: string;
	name: string;
}

export interface AppUser extends StaticUser {
	priceManager: boolean;
}

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
	extraInfo?: string; // For extra pp info
};

export type PreCalculatedItemPartRequest = {
	partToCalculate: PreCalculatedItemPart;
	orderDimensions: OrderDimensions;
};

export type Order = {
	id: string;
	shortId: string;
	storeId: string;
	createdAt: Date;
	amountPayed: number;
	item: Item;
	status: OrderStatus;
	statusUpdated: Date;
	hasArrow: boolean;
	user: StaticUser;
	customer: Customer;
};

export enum FileType {
	VIDEO = 'video',
	PHOTO = 'photo',
	OTHER = 'other'
}

export type File = {
	orderId: string;
	id: string;
	downloadUrl?: string;
	uploadUrl?: string;
	type: FileType;
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

export type MaxAreaM2 = {
	a: number;
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
	areasM2: MaxAreaM2[];
	priority: number;
	maxD1?: number;
	maxD2?: number;
};

export type ListPriceForm = {
	moldId?: string;
} & ListPrice;

export type UserMetadata = {
	priceManager?: boolean;
	storeId?: string;
};

export type WithMetadata = {
	userMetadata: UserMetadata;
};

export type CustomSession = WithMetadata & Session;

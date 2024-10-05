import type { Order } from './api.type';

export enum OrderStatus {
	PENDING = 'pending',
	FINISHED = 'finished',
	DELETED = 'deleted',
	PICKED_UP = 'picked_up',
	QUOTE = 'quote'
}

export type OrderDimensions = {
	originalHeight: number;
	originalWidth: number;
	totalHeight: number;
	totalWidth: number;
	workingHeight: number;
	workingWidth: number;
};

export enum PaymentStatus {
	FULLY_PAID = 'fully_paid',
	PARTIALLY_PAID = 'partially_paid',
	UNPAID = 'unpaid'
}

export enum DimensionsType {
	NORMAL = 'normal',
	EXTERIOR = 'exterior',
	ROUNDED = 'rounded',
	WINDOW = 'window'
}

export enum OrderAuditTrailType {
	STATUS = 'status',
	ATTACHMENT = 'attachment',
	DATA = 'data',
	NOTIFICATION = 'notification',
	PAYMENT = 'payment',
	LOCATION = 'location'
}

type OrderAuditTrailEntryBase = {
	orderId: string;
	userId: string;
	type: OrderAuditTrailType;
	createdAt: Date;
};

export type OrderAuditTrailEntry = {
	oldValue?: string | number | boolean | OrderStatus;
	newValue: string | number | boolean | OrderStatus;
} & OrderAuditTrailEntryBase;

export type OrderAuditTrailEntrWithFullChanges = {
	oldValue: Order;
	newValue: Order;
} & OrderAuditTrailEntryBase;

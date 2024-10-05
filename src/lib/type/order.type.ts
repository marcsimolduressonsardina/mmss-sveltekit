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

export type OrderAuditTrailEntry = {
	orderId: string;
	userId: string;
	userName: string;
	createdAt: Date;
	events: (OrderAuditTrailEvent | OrderAuditTrailEventWithFullChanges)[];
};

type OrderAuditTrailEventBase = {
	orderId: string;
	type: OrderAuditTrailType;
};

export type OrderAuditTrailEvent = {
	oldValue?: string | number | boolean | OrderStatus;
	newValue: string | number | boolean | OrderStatus;
} & OrderAuditTrailEventBase;

export type OrderAuditTrailEventWithFullChanges = {
	oldValue: Order;
	newValue: Order;
} & OrderAuditTrailEventBase;

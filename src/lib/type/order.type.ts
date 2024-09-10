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

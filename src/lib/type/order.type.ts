export enum OrderStatus {
	PENDING = 'pending',
	FINISHED = 'finished',
	DELETED = 'deleted',
	PICKED_UP = 'picked_up'
}

export type OrderDimensions = {
	originalHeight: number;
	originalWidth: number;
	totalHeight: number;
	totalWidth: number;
	workingHeight: number;
	workingWidth: number;
};


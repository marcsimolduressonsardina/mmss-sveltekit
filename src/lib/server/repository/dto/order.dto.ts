export type OrderDto = {
	uuid: string;
	customerUuid: string;
	timestamp: number;
	storeId: string;
	userId: string;
	userName?: string;
	deleted: boolean;
};

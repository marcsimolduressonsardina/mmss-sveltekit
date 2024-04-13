import type { ItemDto } from "./item.dto";

export type OrderDto = {
	uuid: string;
	customerUuid: string;
	timestamp: number;
	storeId: string;
	userId: string;
	userName?: string;
	deleted: boolean;
	amountPayed: number;
	item?: ItemDto;
};

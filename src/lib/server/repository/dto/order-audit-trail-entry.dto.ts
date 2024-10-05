import type { OrderDto } from './order.dto';

export type OrderAuditTrailEntryDto = {
	orderUuid: string;
	userId: string;
	userName: string;
	events: OrderAuditTrailEventDto[];
	timestamp: number;
};

export type OrderAuditTrailEventDto = {
	type: string;
	oldValue?: string | boolean | number | OrderDto;
	newValue?: string | boolean | number | OrderDto;
};

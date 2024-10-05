import type { OrderDto } from './order.dto';

export type OrderAuditTrailEntryDto = {
	orderUuid: string;
	userId: string;
	type: string;
	oldValue?: string | boolean | number | OrderDto;
	newValue?: string | boolean | number | OrderDto;
	timestamp: number;
};

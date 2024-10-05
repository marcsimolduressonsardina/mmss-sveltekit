import type { OrderAuditTrailEntryDto } from './dto/order-audit-trail-entry.dto';

export interface IOrderAuditTrailRepository {
	createOrderAuditTrailEntry(dto: OrderAuditTrailEntryDto): Promise<void>;
	getOrderAuditTrailEntries(orderUuid: string): Promise<OrderAuditTrailEntryDto[]>;
}

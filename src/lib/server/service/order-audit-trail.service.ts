import type { AppUser, Order } from '$lib/type/api.type';
import {
	OrderAuditTrailType,
	OrderStatus,
	type OrderAuditTrailEntrWithFullChanges,
	type OrderAuditTrailEntry
} from '$lib/type/order.type';
import type { OrderAuditTrailEntryDto } from '../repository/dto/order-audit-trail-entry.dto';
import { OrderAuditTrailRepository } from '../repository/order-audit-trail.repository';
import { OrderService } from './order.service';

export class OrderAuditTrailService {
	private auditRepository: OrderAuditTrailRepository;
	private currentUser: AppUser;

	constructor(user: AppUser) {
		this.auditRepository = new OrderAuditTrailRepository();
		this.currentUser = user;
	}

	async logOrderStatusChanged(orderId: string, newStatus: OrderStatus, oldStatus?: OrderStatus) {
		await this.logChanges(orderId, OrderAuditTrailType.STATUS, newStatus, oldStatus);
	}

	async logOrderLocationChanged(orderId: string, newLocation: string, oldLocation?: string) {
		await this.logChanges(orderId, OrderAuditTrailType.LOCATION, newLocation, oldLocation);
	}

	async logOrderNotified(orderId: string) {
		await this.logChanges(orderId, OrderAuditTrailType.NOTIFICATION, true);
	}

	async logOrderPayment(orderId: string, newAmount: number, oldAmount?: number) {
		await this.logChanges(orderId, OrderAuditTrailType.PAYMENT, newAmount, oldAmount);
	}

	async logOrderFullChanges(newOrder: Order, oldOrder: Order) {
		if (oldOrder.id !== newOrder.id) {
			return;
		}

		const auditTrail: OrderAuditTrailEntrWithFullChanges = {
			orderId: newOrder.id,
			userId: this.currentUser.id,
			createdAt: new Date(),
			type: OrderAuditTrailType.DATA,
			newValue: newOrder,
			oldValue: oldOrder
		};

		await this.auditRepository.createOrderAuditTrailEntry(
			OrderAuditTrailService.toDtoFullOrder(auditTrail)
		);
	}

	private async logChanges(
		orderId: string,
		type: OrderAuditTrailType,
		newValue: string | number | boolean | OrderStatus,
		oldValue?: string | number | boolean | OrderStatus
	) {
		if (newValue === oldValue) {
			return;
		}

		const auditTrail: OrderAuditTrailEntry = {
			orderId: orderId,
			userId: this.currentUser.id,
			createdAt: new Date(),
			type,
			newValue,
			oldValue
		};

		await this.auditRepository.createOrderAuditTrailEntry(OrderAuditTrailService.toDto(auditTrail));
	}

	private static toDto(entry: OrderAuditTrailEntry): OrderAuditTrailEntryDto {
		return {
			orderUuid: entry.orderId,
			userId: entry.userId,
			type: entry.type,
			oldValue: entry.oldValue,
			newValue: entry.newValue,
			timestamp: Date.parse(entry.createdAt.toISOString())
		};
	}

	private static toDtoFullOrder(
		entry: OrderAuditTrailEntrWithFullChanges
	): OrderAuditTrailEntryDto {
		return {
			orderUuid: entry.orderId,
			userId: entry.userId,
			type: entry.type,
			oldValue: OrderService.toDto(entry.oldValue),
			newValue: OrderService.toDto(entry.newValue),
			timestamp: Date.parse(entry.createdAt.toISOString())
		};
	}
}

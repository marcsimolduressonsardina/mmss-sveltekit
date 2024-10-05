import type { AppUser, Order } from '$lib/type/api.type';
import {
	OrderAuditTrailType,
	OrderStatus,
	type OrderAuditTrailEventWithFullChanges,
	type OrderAuditTrailEntry,
	type OrderAuditTrailEvent
} from '$lib/type/order.type';
import type {
	OrderAuditTrailEntryDto,
	OrderAuditTrailEventDto
} from '../repository/dto/order-audit-trail-entry.dto';
import { OrderAuditTrailRepository } from '../repository/order-audit-trail.repository';
import { OrderService } from './order.service';

export class OrderAuditTrailService {
	private auditRepository: OrderAuditTrailRepository;
	private currentUser: AppUser;

	constructor(user: AppUser) {
		this.auditRepository = new OrderAuditTrailRepository();
		this.currentUser = user;
	}

	logOrderStatusChanged(
		orderId: string,
		newStatus: OrderStatus,
		oldStatus?: OrderStatus
	): OrderAuditTrailEvent | undefined {
		return this.logChanges(orderId, OrderAuditTrailType.STATUS, newStatus, oldStatus);
	}

	logOrderLocationChanged(
		orderId: string,
		newLocation: string,
		oldLocation?: string
	): OrderAuditTrailEvent | undefined {
		return this.logChanges(orderId, OrderAuditTrailType.LOCATION, newLocation, oldLocation);
	}

	logOrderNotified(orderId: string): OrderAuditTrailEvent | undefined {
		return this.logChanges(orderId, OrderAuditTrailType.NOTIFICATION, true);
	}

	logOrderPayment(
		orderId: string,
		newAmount: number,
		oldAmount?: number
	): OrderAuditTrailEvent | undefined {
		return this.logChanges(orderId, OrderAuditTrailType.PAYMENT, newAmount, oldAmount);
	}

	logOrderFileCreated(orderId: string, fileId: string): OrderAuditTrailEvent | undefined {
		return this.logChanges(orderId, OrderAuditTrailType.ATTACHMENT, fileId, '');
	}

	logOrderFileDeleted(orderId: string, fileId: string): OrderAuditTrailEvent | undefined {
		return this.logChanges(orderId, OrderAuditTrailType.ATTACHMENT, '', fileId);
	}

	logOrderFullChanges(
		newOrder: Order,
		oldOrder: Order
	): OrderAuditTrailEventWithFullChanges | undefined {
		if (oldOrder.id !== newOrder.id) {
			return undefined;
		}

		return {
			orderId: newOrder.id,
			type: OrderAuditTrailType.DATA,
			newValue: newOrder,
			oldValue: oldOrder
		};
	}

	async storeEntry(
		orderId: string,
		events: (OrderAuditTrailEvent | undefined)[] = [],
		fullEvents: (OrderAuditTrailEventWithFullChanges | undefined)[] = []
	) {
		const ids = [
			...new Set([
				...events.filter((event) => event != null).map((event) => event.orderId),
				...fullEvents.filter((event) => event != null).map((event) => event.orderId)
			])
		];

		if (ids.length === 0) {
			return;
		}

		if (ids.length !== 1 || ids[0] !== orderId) {
			throw Error('Id does not match');
		}

		const eventDtos = events
			.filter((event) => event != null)
			.map((event) => OrderAuditTrailService.toDtoEvent(event));
		const fullEventDtos = fullEvents
			.filter((event) => event != null)
			.map((event) => OrderAuditTrailService.toDtoEventWithFullChanges(event));
		const allEventDtos = [...eventDtos, ...fullEventDtos];
		if (allEventDtos.length === 0) {
			return;
		}

		const entry: OrderAuditTrailEntry = {
			orderId: orderId,
			userId: this.currentUser.id,
			userName: this.currentUser.name,
			createdAt: new Date(),
			events: [] // not needed
		};

		const dto = OrderAuditTrailService.toDto(entry, allEventDtos);
		await this.auditRepository.createOrderAuditTrailEntry(dto);
	}

	private logChanges(
		orderId: string,
		type: OrderAuditTrailType,
		newValue: string | number | boolean | OrderStatus,
		oldValue?: string | number | boolean | OrderStatus
	): OrderAuditTrailEvent | undefined {
		if (newValue === oldValue) {
			return undefined;
		}

		return {
			orderId,
			type,
			newValue,
			oldValue
		};
	}

	private static toDto(
		entry: OrderAuditTrailEntry,
		events: OrderAuditTrailEventDto[] = []
	): OrderAuditTrailEntryDto {
		return {
			orderUuid: entry.orderId,
			userId: entry.userId,
			userName: entry.userName,
			events,
			timestamp: Date.parse(entry.createdAt.toISOString())
		};
	}

	private static toDtoEvent(event: OrderAuditTrailEvent): OrderAuditTrailEventDto {
		return {
			type: event.type,
			oldValue: event.oldValue,
			newValue: event.newValue
		};
	}

	private static toDtoEventWithFullChanges(
		event: OrderAuditTrailEventWithFullChanges
	): OrderAuditTrailEventDto {
		return {
			type: event.type,
			oldValue: OrderService.toDto(event.oldValue),
			newValue: OrderService.toDto(event.newValue)
		};
	}
}

import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';
import { CustomerService } from './customer.service';
import type { OrderDto } from '../repository/dto/order.dto';
import { OrderRepository } from '../repository/order.repository';
import type {
	Customer,
	Order,
	AppUser,
	PreCalculatedItemPart,
	Item,
	CalculatedItem,
	FullOrder
} from '$lib/type/api.type';
import { CalculatedItemService } from './calculated-item.service';
import type { ItemDto } from '../repository/dto/item.dto';
import { PricingType } from '$lib/type/pricing.type';
import { InvalidDataError } from '../error/invalid-data.error';
import { isOrderTemp, tempCustomerUuid } from '$lib/shared/order.utilities';
import { DimensionsType, OrderStatus } from '$lib/type/order.type';
import { CalculatedItemUtilities } from '$lib/shared/calculated-item.utilites';
import type { OrderCreationWithCustomerDto } from './dto/order-creation.dto';
import type { OrderCreationDto } from './dto/order-creation.dto';
import { DateTime } from 'luxon';
import { quoteDeliveryDate } from '../shared/order/order-creation.utilities';
import { SearchUtilities } from '../shared/search/search.utilities';
import { OrderAuditTrailService } from './order-audit-trail.service';

export interface ISameDayOrderCounters {
	finishedCount: number;
	pendingCount: number;
	totalCount: number;
}

export class OrderService {
	private readonly storeId: string;
	private repository: OrderRepository;
	private customerService: CustomerService;
	private orderAuditTrailService: OrderAuditTrailService;
	private calculatedItemService: CalculatedItemService;
	private currentUser: AppUser;

	constructor(user: AppUser, customerService?: CustomerService) {
		this.storeId = user.storeId;
		this.repository = new OrderRepository();
		this.customerService = customerService ?? new CustomerService(user);
		this.orderAuditTrailService = new OrderAuditTrailService(user);
		this.currentUser = user;
		this.calculatedItemService = new CalculatedItemService();
	}

	async getOrderById(orderId: string): Promise<Order | null> {
		const orderDto = await this.repository.getOrderById(orderId);
		if (orderDto && orderDto.storeId === this.storeId) {
			const customer =
				orderDto.customerUuid === tempCustomerUuid
					? OrderService.getTempCustomer(this.storeId)
					: await this.customerService.getCustomerById(orderDto.customerUuid);
			if (customer) {
				return OrderService.fromDto(orderDto, customer);
			}
		}

		return null;
	}

	async getFullOrderById(orderId: string): Promise<FullOrder | null> {
		const order = await this.getOrderById(orderId);
		if (order != null) {
			return (await this.getFullOrders([order]))[0];
		}

		return null;
	}

	async getOrdersByStatus(status: OrderStatus): Promise<FullOrder[]> {
		const orderDtos = await this.repository.getOrdersByStatus(status, this.storeId);
		const customerIds = orderDtos.map((dto) => dto.customerUuid);
		const customerMap = await this.customerService.getAllCustomersMap(customerIds);
		customerMap.set(tempCustomerUuid, OrderService.getTempCustomer(this.storeId));
		const orders = orderDtos.map((o) => OrderService.fromDto(o, customerMap.get(o.customerUuid)!));
		return this.getFullOrders(orders);
	}

	async findOrdersByStatus(status: OrderStatus, query: string): Promise<FullOrder[]> {
		const orderDtos = await this.repository.findOrdersByStatus(
			status,
			SearchUtilities.normalizeString(query),
			this.storeId
		);
		const customerIds = orderDtos.map((dto) => dto.customerUuid);
		const customerMap = await this.customerService.getAllCustomersMap(customerIds);
		customerMap.set(tempCustomerUuid, OrderService.getTempCustomer(this.storeId));
		const orders = orderDtos.map((o) => OrderService.fromDto(o, customerMap.get(o.customerUuid)!));
		return this.getFullOrders(orders);
	}

	async indexOrders() {
		const orderDtos = (
			await Promise.all(
				Object.values(OrderStatus)
					.filter((s) => s !== OrderStatus.DELETED)
					.map((s) => this.repository.getOrdersByStatus(s, this.storeId))
			)
		).flat();

		const newOrderDtos = orderDtos.map((order) => ({
			...order,
			item: {
				...order.item,
				normalizedDescription: SearchUtilities.normalizeString(order.item.description)
			}
		}));

		await this.repository.storeOrders(newOrderDtos);
	}

	async getOrdersByCustomerId(customerId: string): Promise<FullOrder[] | null> {
		const customer = await this.customerService.getCustomerById(customerId);
		if (customer === null) return null;

		const orderDtos = await this.repository.getOrdersByCustomerId(customerId);
		const orders = this.processDtosFromRepository(orderDtos, customer).filter(
			(o) => o.status !== OrderStatus.QUOTE
		);

		return this.getFullOrders(orders);
	}

	async getOrdersByCustomerIdAndStatus(
		customerId: string,
		status: OrderStatus
	): Promise<FullOrder[] | null> {
		const customer = await this.customerService.getCustomerById(customerId);
		if (customer === null) return null;

		const orderDtos = await this.repository.getOrdersByCustomerId(customerId);
		const orders = this.processDtosFromRepository(orderDtos, customer).filter(
			(o) => o.status === status
		);
		return this.getFullOrders(orders);
	}

	async getOrdersCountOnSameDay(order: Order): Promise<ISameDayOrderCounters> {
		const dtos = await this.getSameDayOrdersDtos(order);
		const orderDtos = dtos.filter((dto) => dto.status !== OrderStatus.QUOTE.toString());
		const finishedCount = orderDtos.filter(
			(dto) => dto.status === OrderStatus.FINISHED.toString()
		).length;
		const pendingCount = orderDtos.filter(
			(dto) => dto.status === OrderStatus.PENDING.toString()
		).length;
		return { pendingCount, finishedCount, totalCount: orderDtos.length };
	}

	async getOrdersOnSameDay(order: Order): Promise<FullOrder[]> {
		const orderDtos = await this.getSameDayOrdersDtos(order);
		const orders = this.processDtosFromRepository(orderDtos, order.customer).filter(
			(o) => o.status !== OrderStatus.QUOTE
		);
		return this.getFullOrders(orders);
	}

	async createOrderFromDto(dto: OrderCreationDto): Promise<Order | null> {
		const customer =
			dto.customerId == null
				? OrderService.getTempCustomer(this.storeId)
				: await this.customerService.getCustomerById(dto.customerId);

		if (customer === null) return null;
		return this.createOrder({
			...dto,
			customer
		});
	}

	async updateOrderFromDto(orderId: string, dto: OrderCreationDto): Promise<Order | null> {
		if (dto.customerId == null) {
			throw Error('Customer is required');
		}

		const customer = await this.customerService.getCustomerById(dto.customerId);
		if (customer == null) {
			throw Error('Customer is required');
		}

		const order = await this.getOrderById(orderId);
		if (order == null) {
			throw Error('Order not found');
		}

		return this.updateOrder(order, {
			...dto,
			customer
		});
	}

	async addCustomerToTemporaryOrder(customer: Customer, order: Order): Promise<Order> {
		if (!isOrderTemp(order)) {
			throw Error('Order is not temporary');
		}
		const oldDto = OrderService.toDto(order);
		order.customer = customer;
		const newDto = OrderService.toDto(order);
		await this.repository.updateFullOrder(oldDto, newDto);
		return order;
	}

	async moveQuoteToOrder(order: Order, deliveryDate: Date): Promise<Order> {
		if (order.status !== OrderStatus.QUOTE) return order;
		const oldDto = OrderService.toDto(order);
		order.createdAt = DateTime.now().toJSDate();
		order.item.deliveryDate = deliveryDate;
		order.status = OrderStatus.PENDING;
		const newDto = OrderService.toDto(order);
		await this.repository.updateFullOrder(oldDto, newDto);
		await this.orderAuditTrailService.storeEntry(order.id, [
			this.orderAuditTrailService.logOrderStatusChanged(
				order.id,
				OrderStatus.PENDING,
				OrderStatus.QUOTE
			)
		]);
		return order;
	}

	async moveOrderToQuote(order: Order): Promise<Order> {
		if (order.status === OrderStatus.QUOTE) return order;
		const oldStatus = order.status;
		const oldDto = OrderService.toDto(order);
		order.createdAt = DateTime.now().toJSDate();
		order.item.deliveryDate = quoteDeliveryDate;
		order.status = OrderStatus.QUOTE;
		order.notified = false;
		order.amountPayed = 0;
		const newDto = OrderService.toDto(order);
		await this.repository.updateFullOrder(oldDto, newDto);
		await this.orderAuditTrailService.storeEntry(order.id, [
			this.orderAuditTrailService.logOrderStatusChanged(order.id, OrderStatus.QUOTE, oldStatus)
		]);
		return order;
	}

	async setOrderFullyPaid(order: Order) {
		const oldAmount = order.amountPayed;
		const calculatedItem = await this.calculatedItemService.getCalculatedItem(order.id);
		if (calculatedItem == null) return;
		const total = CalculatedItemUtilities.getTotal(calculatedItem);
		order.amountPayed = total;
		await this.repository.updateAmountPayed(OrderService.toDto(order));
		await this.orderAuditTrailService.storeEntry(order.id, [
			this.orderAuditTrailService.logOrderPayment(order.id, order.amountPayed, oldAmount)
		]);
	}

	async setOrderPartiallyPaid(order: Order, amount: number) {
		const oldAmount = order.amountPayed;
		const calculatedItem = await this.calculatedItemService.getCalculatedItem(order.id);
		if (calculatedItem == null) return;
		const total = CalculatedItemUtilities.getTotal(calculatedItem);
		if (amount < 0) {
			throw new InvalidDataError('Invalid amount');
		}

		if (amount > total) {
			order.amountPayed = total;
		} else {
			order.amountPayed = amount;
		}

		await this.repository.updateAmountPayed(OrderService.toDto(order));
		await this.orderAuditTrailService.storeEntry(order.id, [
			this.orderAuditTrailService.logOrderPayment(order.id, order.amountPayed, oldAmount)
		]);
	}

	async setOrderStatus(order: Order, status: OrderStatus, location?: string) {
		const oldStatus = order.status;
		const oldLocation = order.location;
		order.status = status;
		order.location = location ?? '';
		this.repository.setOrderStatus(OrderService.toDto(order));
		await this.orderAuditTrailService.storeEntry(order.id, [
			this.orderAuditTrailService.logOrderStatusChanged(order.id, status, oldStatus),
			this.orderAuditTrailService.logOrderLocationChanged(order.id, order.location, oldLocation)
		]);
	}

	async setOrderAsNotified(order: Order) {
		order.notified = true;
		await this.repository.setOrderNotified(OrderService.toDto(order));
		await this.orderAuditTrailService.storeEntry(order.id, [
			this.orderAuditTrailService.logOrderNotified(order.id)
		]);
	}

	static async getPublicOrder(publicId: string): Promise<Order | null> {
		const repo = new OrderRepository();
		const orderDto = await repo.getOrderByShortId(publicId);
		if (orderDto) {
			const publicCustomer = await CustomerService.getPublicCustomerForPublicOrder(orderDto);
			if (publicCustomer == null) return null;
			return OrderService.fromDto(orderDto, publicCustomer);
		}

		return null;
	}

	private static getTempCustomer(storeId: string): Customer {
		return {
			id: tempCustomerUuid,
			name: 'Temp',
			storeId,
			phone: '+34612345678'
		};
	}

	private processDtosFromRepository(orderDtos: OrderDto[], customer: Customer): Order[] {
		const filteredOrderDtos = orderDtos.filter((dto) => dto.storeId === this.storeId);
		if (filteredOrderDtos.length > 0) {
			const orders = filteredOrderDtos.map((dto) => OrderService.fromDto(dto, customer));
			return orders.sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
		}

		return [];
	}

	private async getSameDayOrdersDtos(order: Order): Promise<OrderDto[]> {
		const firstSecond = new Date(order.createdAt);
		firstSecond.setHours(0, 0, 0, 0);
		const startTs = firstSecond.getTime();

		const lastSecond = new Date(order.createdAt);
		lastSecond.setHours(23, 59, 59, 999);
		const endTs = lastSecond.getTime();

		return this.repository.getOrdersBetweenTs(order.customer.id, startTs, endTs);
	}

	private async createOrder(dto: OrderCreationWithCustomerDto): Promise<Order> {
		const { order, calculatedItem } = await this.generateOrderAndCalculatedItemFromDto(dto);
		await this.repository.createOrder(OrderService.toDto(order));
		await this.calculatedItemService.saveCalculatedItem(calculatedItem);
		await this.orderAuditTrailService.storeEntry(order.id, [
			this.orderAuditTrailService.logOrderStatusChanged(order.id, order.status)
		]);
		return order;
	}

	private async getFullOrders(orders: Order[]): Promise<FullOrder[]> {
		const orderMap = new Map(orders.map((order) => [order.id, order]));
		const calculatedItemsPromises = orders.map((order) =>
			this.calculatedItemService.getCalculatedItem(order.id)
		);
		const calculatedItems = (await Promise.all(calculatedItemsPromises)).filter(
			(calculatedItem) => calculatedItem != null
		);
		return calculatedItems.map((calculatedItem) => ({
			calculatedItem,
			order: orderMap.get(calculatedItem.orderId)!
		}));
	}

	private async updateOrder(
		originalOrder: Order,
		dto: OrderCreationWithCustomerDto
	): Promise<Order> {
		const { order, calculatedItem } = await this.generateOrderAndCalculatedItemFromDto(
			dto,
			originalOrder.id,
			originalOrder.shortId,
			originalOrder.createdAt,
			originalOrder.status,
			originalOrder.location,
			originalOrder.amountPayed,
			originalOrder.notified
		);

		await this.repository.createOrder(OrderService.toDto(order));
		await this.calculatedItemService.saveCalculatedItem(calculatedItem);
		await this.orderAuditTrailService.storeEntry(
			order.id,
			[],
			[this.orderAuditTrailService.logOrderFullChanges(order, originalOrder)]
		);
		return order;
	}

	private async generateOrderAndCalculatedItemFromDto(
		dto: OrderCreationWithCustomerDto,
		originalId?: string,
		originalShortId?: string,
		originalCreationDate?: Date,
		originalOrderStatus?: OrderStatus,
		originalLocation?: string,
		originalAmountPayed?: number,
		originalNotified?: boolean
	): Promise<{ order: Order; calculatedItem: CalculatedItem }> {
		const order: Order = {
			id: originalId ?? uuidv4(),
			shortId: originalShortId ?? '',
			customer: dto.customer,
			createdAt: originalCreationDate ?? new Date(),
			storeId: this.storeId,
			user: this.currentUser,
			amountPayed: originalAmountPayed ?? 0,
			status: originalOrderStatus ?? (dto.isQuote ? OrderStatus.QUOTE : OrderStatus.PENDING),
			hasArrow: dto.hasArrow,
			notified: originalNotified ?? false,
			location: originalLocation ?? '',
			item: {
				width: dto.width,
				height: dto.height,
				pp: dto.pp,
				ppDimensions: dto.ppDimensions,
				description: dto.description,
				predefinedObservations: dto.predefinedObservations,
				observations: dto.observations,
				quantity: dto.quantity,
				deliveryDate: dto.deliveryDate,
				dimensionsType: dto.dimensionsType,
				partsToCalculate: OrderService.optimizePartsToCalculate(dto.partsToCalculate),
				exteriorWidth: dto.exteriorWidth,
				exteriorHeight: dto.exteriorHeight,
				instantDelivery: dto.instantDelivery
			}
		};

		if (order.shortId === '') {
			order.shortId = OrderService.generateShortId(order);
		}
		OrderService.verifyItem(order.item);
		const calculatedItem = await this.calculatedItemService.createCalculatedItem(
			order,
			dto.discount,
			dto.extraParts
		);
		return { order, calculatedItem };
	}

	private static optimizePartsToCalculate(parts: PreCalculatedItemPart[]): PreCalculatedItemPart[] {
		const map = new Map<string, PreCalculatedItemPart>();
		parts.forEach((p) => {
			const id = `${p.type}_${p.id}_${p.moldId ?? ''}_${p.extraInfo ?? ''}`;
			if (map.has(id)) {
				const existingPart = map.get(id)!;
				p.quantity += existingPart.quantity;
			}

			map.set(id, p);
		});

		return Array.from(map.values());
	}

	private static generateShortId(order: Order): string {
		const orderStr = JSON.stringify(order) + uuidv4();
		const base64 = Buffer.from(orderStr).toString('base64');

		// Create an array of numbers from 0 to maxValue (excluding maxValue)
		const numbersArray = Array.from({ length: base64.length }, (_, i) => i);

		// Shuffle the array randomly
		for (let i = numbersArray.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[numbersArray[i], numbersArray[j]] = [numbersArray[j], numbersArray[i]];
		}

		// Select the first 7 numbers (no repeats)
		const randomNumbers = numbersArray.slice(0, 7);
		return randomNumbers.map((num) => base64[num]).join('');
	}

	private static verifyItem(item: Item) {
		if (!item.quantity) {
			throw new InvalidDataError('Invalid item data');
		}

		for (const part of item.partsToCalculate) {
			if (!part.id || !part.quantity || !part.type) {
				throw new InvalidDataError('Invalid item data');
			}
		}
	}

	public static toDto(order: Order): OrderDto {
		return {
			uuid: order.id!,
			shortId: order.shortId,
			customerUuid: order.customer.id,
			timestamp: Date.parse(order.createdAt.toISOString()),
			storeId: order.storeId!,
			userId: order.user.id,
			userName: order.user.name,
			amountPayed: order.amountPayed,
			item: OrderService.toDtoItem(order.item),
			status: order.status,
			hasArrow: order.hasArrow,
			location: order.location,
			notified: order.notified
		};
	}

	private static fromDto(dto: OrderDto, customer: Customer): Order {
		return {
			id: dto.uuid,
			shortId: dto.shortId,
			customer,
			createdAt: new Date(dto.timestamp),
			storeId: dto.storeId,
			user: AuthService.generateStaticUser(dto.userId, dto.userName, dto.storeId),
			amountPayed: dto.amountPayed,
			item: OrderService.fromDtoItem(dto.item),
			status: dto.status as OrderStatus,
			hasArrow: dto.hasArrow ?? false,
			location: dto.location ?? '',
			notified: dto.notified ?? false
		};
	}

	private static toDtoItem(item: Item): ItemDto {
		return {
			width: item.width,
			height: item.height,
			pp: item.pp,
			ppDimensions: item.ppDimensions,
			description: item.description,
			normalizedDescription: SearchUtilities.normalizeString(item.description),
			predefinedObservations: item.predefinedObservations,
			observations: item.observations,
			quantity: item.quantity,
			deliveryDate: Date.parse(item.deliveryDate.toISOString()),
			partsToCalculate: item.partsToCalculate.map((part) => ({
				id: part.id,
				quantity: part.quantity,
				type: part.type as string,
				moldId: part.moldId,
				extraInfo: part.extraInfo
			})),
			exteriorHeight: item.exteriorHeight,
			exteriorWidth: item.exteriorWidth,
			instantDelivery: item.instantDelivery,
			dimensionsType: item.dimensionsType
		};
	}

	private static fromDtoItem(dto: ItemDto): Item {
		return {
			width: dto.width,
			height: dto.height,
			pp: dto.pp,
			ppDimensions: dto.ppDimensions,
			description: dto.description,
			predefinedObservations: dto.predefinedObservations,
			observations: dto.observations,
			quantity: dto.quantity,
			deliveryDate: new Date(dto.deliveryDate),
			partsToCalculate: dto.partsToCalculate.map((part) => ({
				id: part.id,
				quantity: part.quantity,
				type: part.type as PricingType,
				moldId: part.moldId,
				extraInfo: part.extraInfo
			})),
			exteriorHeight: dto.exteriorHeight,
			exteriorWidth: dto.exteriorWidth,
			instantDelivery: dto.instantDelivery ?? false,
			dimensionsType: dto.dimensionsType
				? (dto.dimensionsType as DimensionsType)
				: dto.exteriorHeight != null || dto.exteriorWidth != null
					? DimensionsType.EXTERIOR
					: DimensionsType.NORMAL
		};
	}
}

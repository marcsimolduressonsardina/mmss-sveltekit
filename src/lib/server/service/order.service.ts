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
	CalculatedItemPart,
	Item,
	PPDimensions
} from '$lib/type/api.type';
import { CalculatedItemService } from './calculated-item.service';
import type { ItemDto } from '../repository/dto/item.dto';
import { PricingType } from '$lib/type/pricing.type';
import { InvalidDataError } from '../error/invalid-data.error';
import { isOrderTemp, tempCustomerUuid } from '$lib/shared/order.utilities';
import { OrderStatus } from '$lib/type/order.type';

export class OrderService {
	private readonly storeId: string;
	private repository: OrderRepository;
	private customerService: CustomerService;
	private calculatedItemService: CalculatedItemService;
	private currentUser: AppUser;

	constructor(user: AppUser, customerService?: CustomerService) {
		this.storeId = user.storeId;
		this.repository = new OrderRepository();
		this.customerService = customerService ?? new CustomerService(user);
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

	async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
		const orderDtos = await this.repository.getOrdersByStatus(status, this.storeId);
		const customerIds = orderDtos.map((dto) => dto.customerUuid);
		const customerMap = await this.customerService.getAllCustomersMap(customerIds);
		return orderDtos.map((o) => OrderService.fromDto(o, customerMap.get(o.customerUuid)!));
	}

	async getOrdersByCustomerId(customerId: string): Promise<Order[] | null> {
		const customer = await this.customerService.getCustomerById(customerId);
		if (customer === null) return null;

		const orderDtos = await this.repository.getOrdersByCustomerId(customerId);
		return await this.processDtosFromRepository(orderDtos, customer);
	}

	async getOrdersOnSameDay(order: Order): Promise<Order[]> {
		const firstSecond = new Date(order.createdAt);
		firstSecond.setHours(0, 0, 0, 0);
		const startTs = firstSecond.getTime();

		const lastSecond = new Date(order.createdAt);
		lastSecond.setHours(23, 59, 59, 999);
		const endTs = lastSecond.getTime();

		const orderDtos = await this.repository.getOrdersBetweenTs(order.customer.id, startTs, endTs);
		return await this.processDtosFromRepository(orderDtos, order.customer);
	}

	async createOrderForCustomer(
		customerId: string,
		width: number,
		height: number,
		pp: number = 0,
		description: string = '',
		predefinedObservations: string[] = [],
		observations: string = '',
		quantity: number = 1,
		deliveryDate: Date = new Date(),
		partsToCalculate: PreCalculatedItemPart[] = [],
		extraParts: CalculatedItemPart[] = [],
		discount: number = 0,
		hasArrow: boolean = false,
		ppDimensions?: PPDimensions,
		exteriorWidth?: number,
		exteriorHeight?: number
	): Promise<Order | null> {
		const customer = await this.customerService.getCustomerById(customerId);
		if (customer === null) return null;
		const order = await this.createOrder(
			customer,
			width,
			height,
			pp,
			description,
			predefinedObservations,
			observations,
			quantity,
			deliveryDate,
			partsToCalculate,
			extraParts,
			discount,
			hasArrow,
			ppDimensions,
			exteriorWidth,
			exteriorHeight
		);
		return order;
	}

	async createTempOrder(
		width: number,
		height: number,
		pp: number = 0,
		description: string = '',
		predefinedObservations: string[] = [],
		observations: string = '',
		quantity: number = 1,
		deliveryDate: Date = new Date(),
		partsToCalculate: PreCalculatedItemPart[] = [],
		extraParts: CalculatedItemPart[] = [],
		discount: number = 0,
		hasArrow: boolean = false,
		ppDimensions?: PPDimensions,
		exteriorWidth?: number,
		exteriorHeight?: number
	): Promise<Order> {
		const customer = OrderService.getTempCustomer(this.storeId);
		const order = await this.createOrder(
			customer,
			width,
			height,
			pp,
			description,
			predefinedObservations,
			observations,
			quantity,
			deliveryDate,
			partsToCalculate,
			extraParts,
			discount,
			hasArrow,
			ppDimensions,
			exteriorWidth,
			exteriorHeight
		);
		return order;
	}

	async addCustomerToTemporaryOrder(customer: Customer, order: Order) {
		if (!isOrderTemp(order)) {
			throw Error('Order is not temporary');
		}

		order.customer = customer;
		await this.repository.deleteOrder(tempCustomerUuid, OrderService.toDto(order).timestamp);
		await this.repository.createOrder(OrderService.toDto(order));
	}

	async setOrderFullyPaid(order: Order) {
		const calculatedItem = await this.calculatedItemService.getCalculatedItem(order.id);
		if (calculatedItem == null) return;
		order.amountPayed = calculatedItem.total;
		await this.setOrderPartiallyPaid(order, calculatedItem.total);
	}

	async setOrderPartiallyPaid(order: Order, amount: number) {
		const calculatedItem = await this.calculatedItemService.getCalculatedItem(order.id);
		if (calculatedItem == null) return;
		if (amount < 0) {
			throw new InvalidDataError('Invalid amount');
		}

		if (amount > calculatedItem.total) {
			order.amountPayed = calculatedItem.total;
		} else {
			order.amountPayed = amount;
		}

		await this.repository.updateAmountPayed(OrderService.toDto(order));
	}

	async setOrderStatus(order: Order, status: OrderStatus) {
		order.status = status;
		order.statusUpdated = new Date();
		this.repository.setOrderStatus(OrderService.toDto(order));
	}

	async incrementOrderPayment(order: Order, amount: number) {
		const calculatedItem = await this.calculatedItemService.getCalculatedItem(order.id);
		if (calculatedItem == null) return;
		if (amount < 0) {
			throw new InvalidDataError('Invalid amount');
		}

		const total = order.amountPayed + amount;

		if (total > calculatedItem.total) {
			order.amountPayed = calculatedItem.total;
		} else {
			order.amountPayed = total;
		}

		await this.repository.updateAmountPayed(OrderService.toDto(order));
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

	private async processDtosFromRepository(
		orderDtos: OrderDto[],
		customer: Customer
	): Promise<Order[]> {
		const filteredOrderDtos = orderDtos.filter((dto) => dto.storeId === this.storeId);
		if (filteredOrderDtos.length > 0) {
			const orders = filteredOrderDtos.map((dto) => OrderService.fromDto(dto, customer));
			return orders.sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
		}

		return [];
	}

	private async createOrder(
		customer: Customer,
		width: number,
		height: number,
		pp: number = 0,
		description: string = '',
		predefinedObservations: string[] = [],
		observations: string = '',
		quantity: number = 1,
		deliveryDate: Date = new Date(),
		partsToCalculate: PreCalculatedItemPart[] = [],
		extraParts: CalculatedItemPart[] = [],
		discount: number = 0,
		hasArrow: boolean = false,
		ppDimensions?: PPDimensions,
		exteriorWidth?: number,
		exteriorHeight?: number
	): Promise<Order> {
		const order: Order = {
			id: uuidv4(),
			shortId: '',
			customer,
			createdAt: new Date(),
			storeId: this.storeId,
			user: this.currentUser,
			amountPayed: 0,
			status: OrderStatus.PENDING,
			statusUpdated: new Date(),
			hasArrow,
			item: {
				width,
				height,
				pp,
				ppDimensions,
				description,
				predefinedObservations,
				observations,
				quantity,
				createdAt: new Date(),
				deliveryDate,
				partsToCalculate: OrderService.optimizePartsToCalculate(partsToCalculate),
				exteriorWidth,
				exteriorHeight
			}
		};

		order.shortId = OrderService.generateShortId(order);
		OrderService.verifyItem(order.item);
		const calculatedItem = await this.calculatedItemService.createCalculatedItem(
			order,
			discount,
			extraParts
		);

		await this.repository.createOrder(OrderService.toDto(order));
		await this.calculatedItemService.saveCalculatedItem(calculatedItem);
		return order;
	}

	private static optimizePartsToCalculate(parts: PreCalculatedItemPart[]): PreCalculatedItemPart[] {
		const map = new Map<string, PreCalculatedItemPart>();
		parts.forEach((p) => {
			const id = `${p.type}_${p.id}`;
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
		if (!item.width || !item.height || !item.quantity || !item.createdAt) {
			console.log(item);
			throw new InvalidDataError('Invalid item data');
		}

		for (const part of item.partsToCalculate) {
			if (!part.id || !part.quantity || !part.type) {
				throw new InvalidDataError('Invalid item data');
			}
		}
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
			statusUpdated: new Date(dto.statusTimestamp),
			hasArrow: dto.hasArrow ?? false
		};
	}

	private static toDto(order: Order): OrderDto {
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
			statusTimestamp: Date.parse(order.statusUpdated.toISOString()),
			hasArrow: order.hasArrow
		};
	}

	private static toDtoItem(item: Item): ItemDto {
		return {
			width: item.width,
			height: item.height,
			pp: item.pp,
			ppDimensions: item.ppDimensions,
			description: item.description,
			predefinedObservations: item.predefinedObservations,
			observations: item.observations,
			quantity: item.quantity,
			createdAt: Date.parse(item.createdAt.toISOString()),
			deliveryDate: Date.parse(item.deliveryDate.toISOString()),
			partsToCalculate: item.partsToCalculate.map((part) => ({
				id: part.id,
				quantity: part.quantity,
				type: part.type as string
			})),
			exteriorHeight: item.exteriorHeight,
			exteriorWidth: item.exteriorWidth
		};
	}

	public static fromDtoItem(dto: ItemDto): Item {
		return {
			width: dto.width,
			height: dto.height,
			pp: dto.pp,
			ppDimensions: dto.ppDimensions,
			description: dto.description,
			predefinedObservations: dto.predefinedObservations,
			observations: dto.observations,
			quantity: dto.quantity,
			createdAt: new Date(dto.createdAt),
			deliveryDate: new Date(dto.deliveryDate),
			partsToCalculate: dto.partsToCalculate.map((part) => ({
				id: part.id,
				quantity: part.quantity,
				type: part.type as PricingType
			})),
			exteriorHeight: dto.exteriorHeight,
			exteriorWidth: dto.exteriorWidth
		};
	}
}

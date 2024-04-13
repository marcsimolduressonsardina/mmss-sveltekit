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
	Item
} from '../../type/api.type';
import { CalculatedItemService } from './calculated-item.service';
import type { ItemDto } from '../repository/dto/item.dto';
import { PricingType } from '$lib/type/pricing.type';
import { InvalidDataError } from '../error/invalid-data.error';
import { isOrderTemp, tempCustomerUuid } from '$lib/shared/order.utilities';

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
			const user = AuthService.generateUserFromId(orderDto.userId);
			const customer =
				orderDto.customerUuid === tempCustomerUuid
					? this.getTempCustomer()
					: await this.customerService.getCustomerById(orderDto.customerUuid);
			if (customer && user) {
				return OrderService.fromDto(orderDto, customer, user);
			}
		}

		return null;
	}

	async deleteOrder(order: Order) {
		order.deleted = true;
		await this.repository.setOrderDeleted(true, OrderService.toDto(order));
	}

	async getOrdersByCustomerId(customerId: string): Promise<Order[] | null> {
		const customer = await this.customerService.getCustomerById(customerId);
		if (customer === null) return null;
		const orderDtos = await this.repository.getOrdersByCustomerId(customerId);
		const filteredOrderDtos = orderDtos.filter((dto) => dto.storeId === this.storeId);
		if (filteredOrderDtos.length > 0) {
			const users = AuthService.generateUsersFromIds(
				new Set(filteredOrderDtos.map((dto) => dto.userId))
			);
			const orders = filteredOrderDtos.map((dto) =>
				OrderService.fromDto(dto, customer, users.get(dto.userId)!)
			);
			return orders.sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
		}

		return [];
	}

	async createOrderForCustomer(
		customerId: string,
		width: number,
		height: number,
		passePartoutWidth: number = 0,
		passePartoutHeight: number = 0,
		description: string = '',
		predefinedObservations: string[] = [],
		observations: string = '',
		quantity: number = 1,
		deliveryDate: Date = new Date(),
		partsToCalculate: PreCalculatedItemPart[] = [],
		extraParts: CalculatedItemPart[] = [],
		discount: number = 0,
		authorName?: string | null
	): Promise<Order | null> {
		const customer = await this.customerService.getCustomerById(customerId);
		if (customer === null) return null;
		const order = await this.createOrder(
			customer,
			width,
			height,
			passePartoutWidth,
			passePartoutHeight,
			description,
			predefinedObservations,
			observations,
			quantity,
			deliveryDate,
			partsToCalculate,
			extraParts,
			discount,
			authorName
		);
		return order;
	}

	async createTempOrder(
		width: number,
		height: number,
		passePartoutWidth: number = 0,
		passePartoutHeight: number = 0,
		description: string = '',
		predefinedObservations: string[] = [],
		observations: string = '',
		quantity: number = 1,
		deliveryDate: Date = new Date(),
		partsToCalculate: PreCalculatedItemPart[] = [],
		extraParts: CalculatedItemPart[] = [],
		discount: number = 0,
		authorName?: string | null
	): Promise<Order> {
		const customer = this.getTempCustomer();
		const order = await this.createOrder(
			customer,
			width,
			height,
			passePartoutWidth,
			passePartoutHeight,
			description,
			predefinedObservations,
			observations,
			quantity,
			deliveryDate,
			partsToCalculate,
			extraParts,
			discount,
			authorName
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
		this.setOrderPartiallyPaid(order, calculatedItem.total);
	}

	async setOrderPartiallyPaid(order: Order, amount: number) {
		order.amountPayed = amount;
		this.repository.updateAmountPayed(OrderService.toDto(order), amount);
	}

	private getTempCustomer(): Customer {
		return {
			id: tempCustomerUuid,
			name: 'Temp',
			storeId: this.storeId,
			phone: '+34612345678'
		};
	}

	private async createOrder(
		customer: Customer,
		width: number,
		height: number,
		passePartoutWidth: number = 0,
		passePartoutHeight: number = 0,
		description: string = '',
		predefinedObservations: string[] = [],
		observations: string = '',
		quantity: number = 1,
		deliveryDate: Date = new Date(),
		partsToCalculate: PreCalculatedItemPart[] = [],
		extraParts: CalculatedItemPart[] = [],
		discount: number = 0,
		authorName?: string | null
	): Promise<Order> {
		const order: Order = {
			id: uuidv4(),
			customer,
			createdAt: new Date(),
			storeId: this.storeId,
			user: this.currentUser,
			userName: authorName != null ? authorName : undefined,
			deleted: false,
			amountPayed: 0,
			item: undefined
		};

		const item: Item = {
			width,
			height,
			passePartoutWidth,
			passePartoutHeight,
			description,
			predefinedObservations,
			observations,
			quantity,
			createdAt: new Date(),
			deliveryDate,
			partsToCalculate: partsToCalculate
		};

		OrderService.verifyItem(item);
		order.item = item;
		const calculatedItem = await this.calculatedItemService.createCalculatedItem(
			order,
			item,
			discount,
			extraParts
		);

		await this.repository.createOrder(OrderService.toDto(order));
		await this.calculatedItemService.saveCalculatedItem(calculatedItem);
		return order;
	}

	private static verifyItem(item: Item) {
		// Method that check that all fields are not null and not undefined
		if (!item.width || !item.height || !item.quantity || !item.createdAt) {
			console.log(item);
			throw new InvalidDataError('Invalid item data');
		}

		for (const part of item.partsToCalculate) {
			if (!part.id || !part.quantity || !part.type) {
				throw new InvalidDataError('Invalid item data');
			}

			if (
				part.type === PricingType.PP &&
				(item.passePartoutWidth == null || item.passePartoutHeight == null)
			) {
				throw new InvalidDataError('Invalid item PP data');
			}
		}
	}

	private static fromDto(dto: OrderDto, customer: Customer, user: AppUser): Order {
		return {
			id: dto.uuid,
			customer,
			createdAt: new Date(dto.timestamp),
			storeId: dto.storeId,
			user,
			deleted: dto.deleted,
			userName: dto.userName,
			amountPayed: dto.amountPayed,
			item: dto.item ? OrderService.fromDtoItem(dto.item) : undefined
		};
	}

	private static toDto(order: Order): OrderDto {
		return {
			uuid: order.id!,
			customerUuid: order.customer.id,
			timestamp: Date.parse(order.createdAt.toISOString()),
			storeId: order.storeId!,
			userId: order.user.id,
			deleted: order.deleted,
			userName: order.userName,
			amountPayed: order.amountPayed,
			item: order.item ? OrderService.toDtoItem(order.item) : undefined
		};
	}

	private static toDtoItem(item: Item): ItemDto {
		return {
			width: item.width,
			height: item.height,
			passePartoutWidth: item.passePartoutWidth,
			passePartoutHeight: item.passePartoutHeight,
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
			}))
		};
	}

	public static fromDtoItem(dto: ItemDto): Item {
		return {
			width: dto.width,
			height: dto.height,
			passePartoutWidth: dto.passePartoutWidth,
			passePartoutHeight: dto.passePartoutHeight,
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
			}))
		};
	}
}

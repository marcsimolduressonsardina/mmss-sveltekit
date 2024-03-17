import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';
import { CustomerService } from './customer.service';
import type { OrderDto } from '../repository/dto/order.dto';
import { OrderRepository } from '../repository/order.repository';
import type { Customer, Order, AppUser } from '../../type/api.type';

export class OrderService {
	private readonly storeId: string;
	private repository: OrderRepository;
	private customerService: CustomerService;
	private currentUser: AppUser;

	constructor(user: AppUser, customerService?: CustomerService) {
		this.storeId = user.storeId;
		this.repository = new OrderRepository();
		this.customerService = customerService ?? new CustomerService(user);
		this.currentUser = user;
	}

	async getOrderById(orderId: string): Promise<Order | null> {
		const orderDto = await this.repository.getOrderById(orderId);
		if (orderDto && orderDto.storeId === this.storeId) {
			const user = AuthService.generateUserFromId(orderDto.userId);
			const customer = await this.customerService.getCustomerById(orderDto.customerUuid);
			if (customer && user) {
				return OrderService.fromDto(orderDto, customer, user);
			}
		}

		return null;
	}

	async deleteOrder(order: Order) {
		order.deleted = true
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

	async createOrder(customerId: string, authorName?: string | null): Promise<Order | null> {
		const customer = await this.customerService.getCustomerById(customerId);
		if (customer === null) return null;
		const order = {
			id: uuidv4(),
			customer,
			createdAt: new Date(),
			storeId: this.storeId,
			user: this.currentUser,
			userName: authorName != null ? authorName : undefined,
			deleted: false,
		};

		await this.repository.createOrder(OrderService.toDto(order));
		return order;
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
		};
	}
}

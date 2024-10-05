import type { OrderDto } from './dto/order.dto';

export interface IOrderRepository {
	getOrderById(orderId: string): Promise<OrderDto | null>;
	getOrderByShortId(shortId: string): Promise<OrderDto | null>;
	getOrdersByCustomerId(customerUuid: string): Promise<OrderDto[]>;
	getOrdersByStatus(status: string, storeId: string): Promise<OrderDto[]>;
	findOrdersByStatus(status: string, query: string, storeId: string): Promise<OrderDto[]>;
	getOrdersBetweenTs(customerUuid: string, startTs: number, endTs: number): Promise<OrderDto[]>;
	createOrder(order: OrderDto): Promise<void>;
	setOrderNotified(order: OrderDto): Promise<void>;
	setOrderStatus(order: OrderDto): Promise<void>;
	updateAmountPayed(order: OrderDto): Promise<void>;
	storeOrders(orders: OrderDto[]): Promise<void>;
	deleteOrder(customerUuid: string, timestamp: number): Promise<void>;
	updateFullOrder(oldOrder: OrderDto, newOrder: OrderDto): Promise<void>;
}

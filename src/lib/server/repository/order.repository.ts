import { ORDER_TABLE } from '$env/static/private';

import type { OrderDto } from './dto/order.dto';
import { DynamoRepository } from './dynamo.repository';

export class OrderRepository extends DynamoRepository<OrderDto> {
	constructor() {
		super(ORDER_TABLE, 'customerUuid', 'timestamp');
	}

	public async getOrderById(orderId: string): Promise<OrderDto | null> {
		const dto = await this.getByUuid(orderId);
		if (dto && dto.status !== 'deleted') {
			return dto;
		}

		return null;
	}

	public async getOrdersByCustomerId(customerUuid: string): Promise<OrderDto[]> {
		const dtos = await this.getByPartitionKey(customerUuid);
		return dtos.filter((dto) => dto.status !== 'deleted');
	}

	public async createOrder(order: OrderDto) {
		if (!order.uuid || !order.customerUuid || !order.timestamp || !order.storeId) {
			throw new Error('Invalid order data');
		}

		await this.put(order);
	}

	public async setOrderStatus(order: OrderDto) {
		const updateStatus = this.updateField(order.customerUuid, 'status', order.status, order.timestamp);
		const updateTs = this.updateField(
			order.customerUuid,
			'statusTimestamp',
			order.statusTimestamp,
			order.timestamp
		);
		await Promise.all([updateStatus, updateTs]);
	}

	public async updateAmountPayed(order: OrderDto) {
		this.updateField(order.customerUuid, 'amountPayed', order.amountPayed, order.timestamp);
	}

	public async deleteOrder(customerUuid: string, timestamp: number) {
		await this.batchDelete([{ partitionKey: customerUuid, sortKey: timestamp }]);
	}
}

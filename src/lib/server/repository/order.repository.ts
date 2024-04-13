import { ORDER_TABLE } from '$env/static/private';

import type { OrderDto } from './dto/order.dto';
import { DynamoRepository } from './dynamo.repository';

export class OrderRepository extends DynamoRepository<OrderDto> {
	constructor() {
		super(ORDER_TABLE, 'customerUuid', 'timestamp');
	}

	public async getOrderById(orderId: string): Promise<OrderDto | null> {
		const dto = await this.getByUuid(orderId);
		if (dto && !dto.deleted) {
			return dto;
		}

		return null;
	}

	public async getOrdersByCustomerId(customerUuid: string): Promise<OrderDto[]> {
		const dtos = await this.getByPartitionKey(customerUuid);
		return dtos.filter((dto) => !dto.deleted);
	}

	public async createOrder(order: OrderDto) {
		if (!order.uuid || !order.customerUuid || !order.timestamp || !order.storeId) {
			throw new Error('Invalid order data');
		}

		await this.put(order);
	}

	public async setOrderDeleted(deleted: boolean, order: OrderDto) {
		this.updateField(order.customerUuid, 'deleted', deleted, order.timestamp);
	}

	public async updateAmountPayed(order: OrderDto, amount: number) { 
		this.updateField(order.customerUuid, 'amountPayed', amount, order.timestamp);
	}

	public async deleteOrder(customerUuid: string, timestamp: number) {
		await this.batchDelete([{ partitionKey: customerUuid, sortKey: timestamp }]);
	}

}

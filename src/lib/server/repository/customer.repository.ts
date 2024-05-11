import { CUSTOMER_TABLE } from '$env/static/private';

import type { CustomerDto } from './dto/customer.dto';
import { DynamoRepository } from './dynamo.repository';

export class CustomerRepository extends DynamoRepository<CustomerDto> {
	constructor() {
		super(CUSTOMER_TABLE, 'storeId', 'phone');
	}

	public async getCustomerById(customerId: string): Promise<CustomerDto | null> {
		const dto = await this.getByUuid(customerId);
		return dto;
	}

	public async getAllCustomers(storeId: string): Promise<CustomerDto[]> {
		const dtos = await this.getByPartitionKey(storeId);
		return dtos;
	}

	public async getCustomerByPhone(storeId: string, phone: string): Promise<CustomerDto | null> {
		const dto = await this.get(storeId, phone);
		return dto;
	}

	public async createCustomer(customer: CustomerDto) {
		if (!customer.uuid || !customer.name || !customer.phone || !customer.storeId) {
			throw new Error('Invalid customer data');
		}

		await this.put(customer);
	}
}

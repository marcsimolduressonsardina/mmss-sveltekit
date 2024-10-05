import { CUSTOMER_TABLE } from '$env/static/private';
import type { ICustomerRepository } from '../customer.repository.interface';

import type { CustomerDto } from '../dto/customer.dto';
import type { IPaginatedDtoResult } from '../dto/paginated-result.dto.interface';
import { DynamoRepository } from './dynamo.repository';

export class CustomerRepositoryDynamoDb
	extends DynamoRepository<CustomerDto>
	implements ICustomerRepository
{
	constructor() {
		super(CUSTOMER_TABLE, 'storeId', 'phone');
	}

	public async getCustomerById(customerId: string): Promise<CustomerDto | null> {
		const dto = await this.getByUuid(customerId);
		return dto;
	}

	public async deleteCustomer(customer: CustomerDto): Promise<void> {
		await this.batchDelete([{ partitionKey: customer.storeId, sortKey: customer.phone }]);
	}

	public async getAllCustomers(storeId: string): Promise<CustomerDto[]> {
		const dtos = await this.getByPartitionKey(storeId);
		return dtos;
	}

	public async getAllCustomersPaginated(
		storeId: string,
		lastCustomerPhone?: string
	): Promise<IPaginatedDtoResult<CustomerDto>> {
		return this.getByPartitionKeyPaginated(storeId, true, lastCustomerPhone);
	}

	public async storeCustomers(customers: CustomerDto[]) {
		await this.batchPut(customers);
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

	public async updateName(storeId: string, phone: string, newName: string) {
		await this.updateField(storeId, 'name', newName, phone);
	}

	public async updateFullCustomer(oldCustomer: CustomerDto, newCustomer: CustomerDto) {
		await this.updateFullObject(oldCustomer, newCustomer);
	}

	public async searchCustomer(storeId: string, normalizedQuery: string): Promise<CustomerDto[]> {
		return this.search(storeId, normalizedQuery, 'normalizedName');
	}
}

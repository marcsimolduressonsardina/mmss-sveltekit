import type { CustomerDto } from './dto/customer.dto';
import type { IPaginatedDtoResult } from './dto/paginated-result.dto.interface';

export interface ICustomerRepository {
	getCustomerById(customerId: string): Promise<CustomerDto | null>;
	deleteCustomer(customer: CustomerDto): Promise<void>;
	getAllCustomers(storeId: string): Promise<CustomerDto[]>;
	getAllCustomersPaginated(
		storeId: string,
		lastCustomerPhone?: string
	): Promise<IPaginatedDtoResult<CustomerDto>>;
	storeCustomers(customers: CustomerDto[]): Promise<void>;
	getCustomerByPhone(storeId: string, phone: string): Promise<CustomerDto | null>;
	createCustomer(customer: CustomerDto): Promise<void>;
	updateName(storeId: string, phone: string, newName: string): Promise<void>;
	updateFullCustomer(oldCustomer: CustomerDto, newCustomer: CustomerDto): Promise<void>;
	searchCustomer(storeId: string, normalizedQuery: string): Promise<CustomerDto[]>;
}

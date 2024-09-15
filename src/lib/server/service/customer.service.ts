import { v4 as uuidv4 } from 'uuid';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

import { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from '$env/static/private';

import { InvalidDataError } from '../error/invalid-data.error';
import { CustomerRepository } from '../repository/customer.repository';
import type { CustomerDto } from '../repository/dto/customer.dto';
import type { Customer, AppUser } from '../../type/api.type';
import type { OrderDto } from '../repository/dto/order.dto';

interface PaginatedCustomers {
	customers: Customer[];
	nextKey?: string;
}

export class CustomerService {
	private readonly storeId: string;
	private repository: CustomerRepository;
	private snsClient?: SNSClient;

	constructor(user: AppUser) {
		this.storeId = user.storeId;
		this.repository = new CustomerRepository();
	}

	public async getCustomerById(customerId: string): Promise<Customer | null> {
		const customerDto = await this.repository.getCustomerById(customerId);
		if (customerDto && customerDto.storeId === this.storeId) {
			return CustomerService.fromDto(customerDto);
		}

		return null;
	}

	public async deleteCustomerById(customerId: string) {
		const customerDto = await this.repository.getCustomerById(customerId);
		if (customerDto && customerDto.storeId === this.storeId) {
			await this.repository.deleteCustomer(customerDto);
		}
	}

	public async getAllCustomersMap(filterIds?: string[]): Promise<Map<string, Customer>> {
		const map = new Map<string, Customer>();
		const filterSet = new Set<string>(filterIds ?? []);
		const dtos = await this.repository.getAllCustomers(this.storeId);
		dtos.forEach((dto) => {
			if (filterIds == null || filterSet.has(dto.uuid)) {
				const customer = CustomerService.fromDto(dto);
				map.set(customer.id, customer);
			}
		});

		return map;
	}

	public async getAllCustomersPaginated(nextKey?: string): Promise<PaginatedCustomers> {
		const paginatedDtos = await this.repository.getAllCustomersPaginated(
			this.storeId,
			nextKey ? atob(nextKey) : undefined
		);

		return {
			customers: paginatedDtos.elements.map((dto) => CustomerService.fromDto(dto)),
			nextKey: paginatedDtos.endKey ? btoa(paginatedDtos.endKey as string) : undefined
		};
	}

	public async indexCustomers() {
		const customerDtos = await this.repository.getAllCustomers(this.storeId);
		const newDtos = customerDtos
			.map((dto) => CustomerService.fromDto(dto))
			.map((c) => CustomerService.toDto(c));
		await this.repository.storeCustomers(newDtos);
	}

	public async searchCustomers(query: string): Promise<Customer[]> {
		const dtos = await this.repository.searchCustomer(
			this.storeId,
			CustomerService.normalizeName(query)
		);

		return dtos.map((dto) => CustomerService.fromDto(dto));
	}

	public async updateCustomerData(
		customer: Customer,
		name?: string,
		phone?: string
	): Promise<Customer> {
		customer.name = name ?? customer.name;
		customer.phone = phone ?? customer.phone;
		CustomerService.validate(customer);
		const newCustomerDto = CustomerService.toDto(customer);
		await this.repository.createCustomer(newCustomerDto);
		return customer;
	}

	public async getCustomerByPhone(phone: string): Promise<Customer | null> {
		const dto = await this.repository.getCustomerByPhone(this.storeId, phone);
		return dto ? CustomerService.fromDto(dto) : null;
	}

	public async createCustomer(name: string, phone: string): Promise<Customer> {
		const customer = {
			id: uuidv4(),
			name,
			storeId: this.storeId,
			phone
		};

		CustomerService.validate(customer);
		await this.repository.createCustomer(CustomerService.toDto(customer));
		return customer;
	}

	public async sendSmsToCustomer(customer: Customer, message: string): Promise<void> {
		const params = {
			Message: message,
			PhoneNumber: customer.phone
		};

		// Create a command to send the SMS
		const command = new PublishCommand(params);
		await this.getSnsClient().send(command);
	}

	public static async getPublicCustomerForPublicOrder(order: OrderDto): Promise<Customer | null> {
		const repo = new CustomerRepository();
		const customerDto = await repo.getCustomerById(order.customerUuid);
		if (customerDto && customerDto.storeId === order.storeId) {
			return CustomerService.fromDto(customerDto);
		}

		return null;
	}

	private getSnsClient(): SNSClient {
		if (!this.snsClient) {
			this.snsClient = new SNSClient({
				region: AWS_REGION,
				credentials: {
					accessKeyId: AWS_ACCESS_KEY_ID,
					secretAccessKey: AWS_SECRET_ACCESS_KEY
				}
			});
		}
		return this.snsClient;
	}

	private static validate(customer: Customer) {
		if (!customer.name || !customer.phone || customer.name === '' || customer.phone === '') {
			throw new InvalidDataError('Invalid name and/or phone');
		}

		// Validate phone format
		const phoneRegex = /^\+\d{1,3}\d{9,15}$/;
		if (!phoneRegex.test(customer.phone)) {
			throw new InvalidDataError('Invalid phone format');
		}
	}

	private static normalizeName(input: string): string {
		// Convert to lowercase
		let normalized = input.toLowerCase();

		// Remove diacritics (accents)
		normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

		// Remove special characters (anything that is not a letter, number, or whitespace)
		normalized = normalized.replace(/[^a-z0-9\s]/g, '');

		// Trim whitespace
		normalized = normalized.trim();

		return normalized;
	}

	private static fromDto(dto: CustomerDto): Customer {
		return {
			id: dto.uuid,
			name: dto.name,
			phone: dto.phone,
			storeId: dto.storeId
		};
	}

	private static toDto(customer: Customer): CustomerDto {
		return {
			uuid: customer.id,
			name: customer.name,
			phone: customer.phone,
			storeId: customer.storeId,
			normalizedName: CustomerService.normalizeName(customer.name)
		};
	}
}

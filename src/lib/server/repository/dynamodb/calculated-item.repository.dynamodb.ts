import { CALCULATED_ITEM_ORDER_TABLE } from '$env/static/private';
import type { ICalculatedItemRepository } from '../calculated-item.repository.interface';

import type { CalculatedItemDto } from '../dto/calculated-item.dto';
import { DynamoRepository } from './dynamo.repository';

export class CalculatedItemRepositoryDynamoDb
	extends DynamoRepository<CalculatedItemDto>
	implements ICalculatedItemRepository
{
	constructor() {
		super(CALCULATED_ITEM_ORDER_TABLE, 'orderUuid');
	}

	public async getCalculatedItemById(orderUuid: string): Promise<CalculatedItemDto | null> {
		const dto = await this.get(orderUuid);
		return dto;
	}

	public async createCalculatedItem(calculatedItem: CalculatedItemDto) {
		await this.put(calculatedItem);
	}
}

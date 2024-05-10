import { CALCULATED_ITEM_ORDER_TABLE } from '$env/static/private';

import type { CalculatedItemDto } from './dto/calculated-item.dto';
import { DynamoRepository } from './dynamo.repository';

export class CalculatedItemRepository extends DynamoRepository<CalculatedItemDto> {
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

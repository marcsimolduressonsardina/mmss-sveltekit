import type { CalculatedItemDto } from './dto/calculated-item.dto';

export interface ICalculatedItemRepository {
	getCalculatedItemById(orderUuid: string): Promise<CalculatedItemDto | null>;
	createCalculatedItem(calculatedItem: CalculatedItemDto): Promise<void>;
}

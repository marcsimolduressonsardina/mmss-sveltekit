import type { PricingType } from '$lib/type/pricing.type';
import type { ListPriceDto } from './dto/list-price.dto';

export interface IListPricingRepository {
	getByTypeAndId(type: PricingType, id: string): Promise<ListPriceDto | null>;
	getByInternalId(uuid: string): Promise<ListPriceDto | null>;
	storeListPrice(price: ListPriceDto): Promise<void>;
	batchStoreListPrices(prices: ListPriceDto[]): Promise<void>;
	getAllPricesByType(type: PricingType): Promise<ListPriceDto[]>;
	deleteListPrices(type: PricingType, ids: string[]): Promise<void>;
	deleteListPrice(type: PricingType, id: string): Promise<void>;
}

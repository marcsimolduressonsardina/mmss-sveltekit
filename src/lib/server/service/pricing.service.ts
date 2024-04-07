import { v4 as uuidv4 } from 'uuid';
import {
	leftoverPricing,
	fitAreaPricing,
	getFabricPrice,
	getMoldPrice,
	areaPricing
} from '../data/static-pricing';
import type { ListPriceDto } from '../repository/dto/list-price.dto';
import { ListPricingRepository } from '../repository/list-pricing.repository';
import { PricingFormula, PricingType } from '../../type/pricing.type';
import { InvalidSizeError } from '../error/invalid-size.error';
import type { ListPrice, MaxArea } from '../../type/api.type';

export class PricingService {
	private listPricingRepository: ListPricingRepository;

	private readonly fabricPricing: ListPrice = {
		id: 'fabric',
		internalId: '',
		price: 0,
		description: 'Estirar tela',
		type: PricingType.FABRIC,
		formula: PricingFormula.NONE,
		areas: [],
		maxD1: 300,
		maxD2: 250
	};

	constructor() {
		this.listPricingRepository = new ListPricingRepository();
	}

	public async getPricingList(type: PricingType): Promise<ListPrice[]> {
		const prices = await this.listPricingRepository.getAllPricesByType(type);
		return prices.map(PricingService.fromDto);
	}

	public async getPriceListByInternalId(id: string): Promise<ListPrice | undefined> {
		const priceDto = await this.listPricingRepository.getByInternalId(id);
		return priceDto ? PricingService.fromDto(priceDto) : undefined;
	}

	public async batchStoreListPrices(prices: ListPrice[]): Promise<void> {
		await this.listPricingRepository.batchStoreListPrices(
			prices.map((p) => PricingService.toDto(PricingService.cleanAndVerifyEntity(p)))
		);
	}

	public async deleteListPrices(type: PricingType, ids: string[]): Promise<void> {
		await this.listPricingRepository.deleteListPrices(type, ids);
	}

	public async updatePricing(listPrice: ListPrice): Promise<void> {
		await this.listPricingRepository.storeListPrice(
			PricingService.toDto(PricingService.cleanAndVerifyEntity(listPrice))
		);
	}

	public async createPricing(
		id: string,
		price: number,
		description: string,
		type: PricingType,
		formula: PricingFormula,
		areas: MaxArea[] = [],
		maxD1?: number,
		maxD2?: number
	): Promise<void> {
		const listPrice: ListPrice = {
			id,
			internalId: uuidv4(),
			price,
			description,
			type,
			formula,
			areas,
			maxD1,
			maxD2
		};

		await this.listPricingRepository.storeListPrice(
			PricingService.toDto(PricingService.cleanAndVerifyEntity(listPrice))
		);
	}

	public async calculatePrice(
		pricingType: PricingType,
		d1d: number,
		d2d: number,
		id?: string
	): Promise<{ price: number; description: string }> {
		const { d1, d2 } = PricingService.cleanAndOrder(d1d, d2d);
		if (id == null && pricingType !== PricingType.FABRIC) throw Error('Id is required');

		const pricing =
			pricingType === PricingType.FABRIC
				? this.fabricPricing
				: await this.getPriceFromListById(pricingType, id!);

		PricingService.checkMaxMinDimensions(d1, d2, pricing);
		const price = PricingService.getPriceByType(d1, d2, pricing);
		return { price, description: pricing.description };
	}

	public async getPriceFromListById(pricingType: PricingType, id: string): Promise<ListPrice> {
		const priceDto = await this.listPricingRepository.getByTypeAndId(pricingType, id);
		if (priceDto == null) {
			throw Error('Price not found');
		}

		return PricingService.fromDto(priceDto);
	}

	private static getPriceByType(d1: number, d2: number, priceInfo: ListPrice): number {
		switch (priceInfo.type) {
			case PricingType.MOLD:
				return getMoldPrice(priceInfo.price, d1, d2);
			case PricingType.FABRIC:
				return getFabricPrice(d1, d2);
			case PricingType.BACK:
			case PricingType.GLASS:
			case PricingType.OTHER:
			case PricingType.PP:
				return PricingService.getPriceByFormula(priceInfo, d1, d2);
			default:
				throw Error('Pricing type not supported');
		}
	}

	private static getPriceByFormula(priceInfo: ListPrice, d1: number, d2: number): number {
		switch (priceInfo.formula) {
			case PricingFormula.FORMULA_LEFTOVER:
				return leftoverPricing(priceInfo.price, d1, d2);
			case PricingFormula.FORMULA_FIT_AREA:
				return fitAreaPricing(priceInfo, d1, d2);
			case PricingFormula.FORMULA_AREA:
				return areaPricing(priceInfo.price, d1, d2);
			case PricingFormula.NONE:
				return priceInfo.price;
			default:
				throw Error('Formula not found');
		}
	}

	private static cleanAndVerifyEntity(listPrice: ListPrice): ListPrice {
		if (listPrice.formula === PricingFormula.FORMULA_FIT_AREA && listPrice.areas.length === 0) {
			throw Error('Areas are required for fit area pricing');
		}

		if (
			listPrice.formula !== PricingFormula.FORMULA_FIT_AREA &&
			(listPrice.price == null || (listPrice.price <= 0 && listPrice.type !== PricingType.MOLD))
		) {
			console.log(listPrice);
			throw Error('No price provided for this formula');
		}

		if (listPrice.formula === PricingFormula.FORMULA_FIT_AREA) {
			listPrice.price = 0;
		} else {
			listPrice.areas = [];
		}

		if (listPrice.type === PricingType.MOLD) {
			listPrice.maxD1 = 300;
			listPrice.maxD2 = 265;
			listPrice.formula = PricingFormula.NONE;
		}

		return listPrice;
	}

	private static cleanAndOrder(d1d: number, d2d: number) {
		const max = Math.max(d1d, d2d);
		const min = Math.min(d1d, d2d);
		return { d1: Math.floor(max), d2: Math.floor(min) };
	}

	private static checkMaxMinDimensions(d1w: number, d2w: number, pricing: ListPrice) {
		if (pricing.formula === PricingFormula.NONE && pricing.type === PricingType.OTHER) return;

		if (pricing.maxD1 != null && pricing.maxD2 != null) {
			const { d1, d2 } = PricingService.cleanAndOrder(pricing.maxD1, pricing.maxD2);
			if (d1w > d1 || d2w > d2)
				throw new InvalidSizeError(
					`Dimensiones máximas superadas para ${pricing.description} (${pricing.id}). Max: ${d1}x${d2}`
				);
		}
		if (d1w < 15 || d2w < 15)
			throw new InvalidSizeError(
				`Dimensiones mínimas no alcanzadas para ${pricing.description} (${pricing.id}). Min: 15x15`
			);
	}

	private static toDto(price: ListPrice): ListPriceDto {
		return {
			id: price.id,
			uuid: price.internalId,
			price: price.price,
			description: price.description,
			type: price.type,
			formula: price.formula,
			areas: price.areas,
			maxD1: price.maxD1,
			maxD2: price.maxD2
		};
	}

	private static fromDto(dto: ListPriceDto): ListPrice {
		return {
			id: dto.id,
			internalId: dto.uuid,
			price: dto.price,
			description: dto.description,
			type: dto.type as PricingType,
			formula: dto.formula as PricingFormula,
			areas: dto.areas,
			maxD1: dto.maxD1,
			maxD2: dto.maxD2
		};
	}
}

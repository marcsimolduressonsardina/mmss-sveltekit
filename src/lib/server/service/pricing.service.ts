import { v4 as uuidv4 } from 'uuid';
import {
	leftoverPricing,
	fitAreaPricing,
	getFabricPrice,
	getMoldPrice,
	areaPricing,
	getCrossbarPrice,
	linearPricing,
	fitAreaM2Pricing
} from '../data/static-pricing';
import type { ListPriceDto } from '../repository/dto/list-price.dto';
import { ListPricingRepository } from '../repository/list-pricing.repository';
import { PricingFormula, PricingType } from '../../type/pricing.type';
import { InvalidSizeError } from '../error/invalid-size.error';
import type { ListPrice, MaxArea, MaxAreaM2 } from '../../type/api.type';
import {
	PricingUtilites,
	fabricDefaultPricing,
	fabricIds,
	fitFormulas
} from '$lib/shared/pricing.utilites';
import type { OrderDimensions } from '$lib/type/order.type';

export class PricingService {
	private listPricingRepository: ListPricingRepository;

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
		minPrice: number,
		description: string,
		type: PricingType,
		formula: PricingFormula,
		areas: MaxArea[] = [],
		areasM2: MaxAreaM2[] = [],
		priority: number,
		maxD1?: number,
		maxD2?: number
	): Promise<void> {
		const listPrice: ListPrice = {
			id,
			internalId: uuidv4(),
			price,
			minPrice,
			description,
			type,
			formula,
			areas,
			areasM2,
			maxD1,
			maxD2,
			priority
		};

		await this.listPricingRepository.storeListPrice(
			PricingService.toDto(PricingService.cleanAndVerifyEntity(listPrice))
		);
	}

	public async calculatePrice(
		pricingType: PricingType,
		orderDimensions: OrderDimensions,
		id: string,
		moldFabricId?: string
	): Promise<{ price: number; description: string }> {
		const pricing =
			pricingType === PricingType.FABRIC
				? await this.getFabricPriceList(id, orderDimensions, moldFabricId)
				: await this.getPriceFromListById(pricingType, id);

		PricingService.checkMaxMinDimensions(orderDimensions, pricing);
		const price = PricingService.getPriceByType(orderDimensions, pricing);
		return { price: Math.max(price, pricing.minPrice), description: pricing.description };
	}

	public async getPriceFromListById(pricingType: PricingType, id: string): Promise<ListPrice> {
		const priceDto = await this.listPricingRepository.getByTypeAndId(pricingType, id);
		if (priceDto == null) {
			throw Error('Price not found');
		}

		return PricingService.fromDto(priceDto);
	}

	private async getFabricPriceList(
		id: string,
		orderDimensions: OrderDimensions,
		moldFabricId?: string
	): Promise<ListPrice> {
		if (id === fabricIds.labour) {
			return fabricDefaultPricing;
		}

		if (moldFabricId == null) {
			throw Error('Mold fabric id is required');
		}

		const { d1, d2 } = PricingService.cleanAndOrderTotalDimensions(orderDimensions);
		const moldPrice = await this.getPriceFromListById(PricingType.MOLD, moldFabricId);
		return PricingUtilites.generateCrossbarPricing(
			id,
			moldPrice.price,
			moldPrice.description,
			PricingUtilites.getFabricCrossbarDimension(id, d1, d2),
			moldPrice.id
		);
	}

	private static getPriceByType(orderDimensions: OrderDimensions, priceInfo: ListPrice): number {
		switch (priceInfo.type) {
			case PricingType.MOLD:
				return PricingService.getMoldPrice(priceInfo, orderDimensions);
			case PricingType.FABRIC:
				return PricingService.getFabricPrice(priceInfo, orderDimensions);
			case PricingType.BACK:
			case PricingType.GLASS:
			case PricingType.OTHER:
			case PricingType.LABOUR:
			case PricingType.PP:
				return PricingService.getPriceByFormula(priceInfo, orderDimensions);
			default:
				throw Error('Pricing type not supported');
		}
	}

	private static getMoldPrice(priceInfo: ListPrice, orderDimensions: OrderDimensions): number {
		const { d1, d2 } = PricingService.cleanAndOrderWorkingDimensions(orderDimensions);
		return getMoldPrice(priceInfo.price, d1, d2);
	}

	private static getFabricPrice(priceInfo: ListPrice, orderDimensions: OrderDimensions): number {
		const { d1, d2 } = PricingService.cleanAndOrderWorkingDimensions(orderDimensions);
		const { d1: d1t, d2: d2t } = PricingService.cleanAndOrderTotalDimensions(orderDimensions);
		if (priceInfo.id === fabricIds.labour) {
			return getFabricPrice(d1, d2);
		} else {
			return getCrossbarPrice(
				priceInfo.price,
				PricingUtilites.getFabricCrossbarDimension(priceInfo.id, d1t, d2t)
			);
		}
	}

	private static getPriceByFormula(priceInfo: ListPrice, orderDimensions: OrderDimensions): number {
		const { d1, d2 } = PricingService.cleanAndOrderWorkingDimensions(orderDimensions);
		const { d1: d1t, d2: d2t } = PricingService.cleanAndOrderTotalDimensions(orderDimensions);
		switch (priceInfo.formula) {
			case PricingFormula.FORMULA_LEFTOVER:
				return leftoverPricing(priceInfo.price, d1, d2);
			case PricingFormula.FORMULA_FIT_AREA:
				return fitAreaPricing(priceInfo, d1t, d2t);
			case PricingFormula.FORMULA_FIT_AREA_M2:
				return fitAreaM2Pricing(priceInfo, d1t, d2t);
			case PricingFormula.FORMULA_AREA:
				return areaPricing(priceInfo.price, d1, d2);
			case PricingFormula.FORMULA_LINEAR:
				return linearPricing(priceInfo.price, d1, d2);
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
			listPrice.formula === PricingFormula.FORMULA_FIT_AREA_M2 &&
			listPrice.areasM2.length === 0
		) {
			throw Error('Areas m2 are required for fit area m2 pricing');
		}

		if (
			!fitFormulas.includes(listPrice.formula) &&
			(listPrice.price == null || (listPrice.price <= 0 && listPrice.type !== PricingType.MOLD))
		) {
			console.log(listPrice);
			throw Error('No price provided for this formula');
		}

		if (fitFormulas.includes(listPrice.formula)) {
			listPrice.price = 0;
			if (listPrice.formula !== PricingFormula.FORMULA_FIT_AREA) {
				listPrice.areas = [];
			}

			if (listPrice.formula !== PricingFormula.FORMULA_FIT_AREA_M2) {
				listPrice.areasM2 = [];
			}
		} else {
			listPrice.areas = [];
			listPrice.areasM2 = [];
		}

		if (listPrice.type === PricingType.MOLD) {
			listPrice.maxD1 = 300;
			listPrice.maxD2 = 265;
			listPrice.formula = PricingFormula.NONE;
		}

		return listPrice;
	}

	private static cleanAndOrder(d1d: number, d2d: number, floor: boolean = true) {
		const max = Math.max(d1d, d2d);
		const min = Math.min(d1d, d2d);
		if (floor) {
			return { d1: Math.floor(max), d2: Math.floor(min) };
		} else {
			return { d1: max, d2: min };
		}
	}

	private static cleanAndOrderWorkingDimensions(orderDimensions: OrderDimensions) {
		return PricingService.cleanAndOrder(
			orderDimensions.workingHeight,
			orderDimensions.workingWidth
		);
	}

	private static cleanAndOrderTotalDimensions(orderDimensions: OrderDimensions) {
		return PricingService.cleanAndOrder(
			orderDimensions.totalHeight,
			orderDimensions.totalWidth,
			false
		);
	}

	private static checkMaxMinDimensions(orderDimensions: OrderDimensions, pricing: ListPrice) {
		if (pricing.formula === PricingFormula.NONE && pricing.type === PricingType.OTHER) return;
		const { d1: d1w, d2: d2w } = PricingService.cleanAndOrderWorkingDimensions(orderDimensions);
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
			areasM2: price.areasM2,
			maxD1: price.maxD1,
			maxD2: price.maxD2,
			priority: price.priority,
			minPrice: price.minPrice
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
			areasM2: dto.areasM2 ?? [],
			maxD1: dto.maxD1,
			maxD2: dto.maxD2,
			priority: dto.priority ?? 0,
			minPrice: dto.minPrice ?? 0
		};
	}
}

import { v4 as uuidv4 } from 'uuid';
import { CalculatedItemService } from './calculated-item.service';
import { OrderService } from './order.service';
import { InvalidDataError } from '../error/invalid-data.error';
import type { ItemDto } from '../repository/dto/item.dto';
import { ItemRepository } from '../repository/item.repository';
import type {
	CalculatedItem,
	CalculatedItemPart,
	Item,
	ItemResponse,
	Order,
	AppUser,
	PreCalculatedItemPart
} from '../../type/api.type';
import { PricingType } from '$lib/type/pricing.type';

export class ItemService {
	private itemRepository: ItemRepository;
	private orderService: OrderService;
	private calculatedItemService: CalculatedItemService;
	private readonly storeId: string;

	constructor(user: AppUser, orderService?: OrderService) {
		this.itemRepository = new ItemRepository();
		this.storeId = user.storeId;
		this.orderService = orderService ?? new OrderService(user);
		this.calculatedItemService = new CalculatedItemService();
	}

	async getItemByOrderIdAndId(orderId: string, itemId: string): Promise<ItemResponse | null> {
		const order = await this.orderService.getOrderById(orderId);
		if (!order) return null;
		const itemDto = await this.itemRepository.getItemById(order.id, itemId);
		if (itemDto == null) {
			return null;
		}

		const item = ItemService.fromDto(itemDto);
		const calculatedItem = await this.calculatedItemService.getCalculatedItem(item.id);
		if (calculatedItem == null) return null;
		return { itemInfo: item, calculatedItem };
	}

	async getItemsByOrderId(orderId: string): Promise<ItemResponse[] | null> {
		const order = await this.orderService.getOrderById(orderId);
		if (!order) return null;
		const itemDtos = await this.itemRepository.getItemsByOrderId(order.id);
		const itemMap = new Map<string, Item>();
		itemDtos.forEach((dto) => itemMap.set(dto.itemUuid, ItemService.fromDto(dto)));
		const itemIds = Array.from(itemMap.keys());
		const calculatedItems = await Promise.all(
			itemIds.map((id) => this.calculatedItemService.getCalculatedItem(id))
		);
		const calculatedItemMap = new Map<string, CalculatedItem>();
		calculatedItems.forEach((ci) => {
			if (ci != null) calculatedItemMap.set(ci.itemId, ci);
		});

		return Array.from(calculatedItemMap.keys()).map((id) => ({
			itemInfo: itemMap.get(id)!,
			calculatedItem: calculatedItemMap.get(id)!
		}));
	}

	async createItem(
		orderId: string,
		width: number,
		height: number,
		passePartoutWidth: number = 0,
		passePartoutHeight: number = 0,
		description: string = '',
		observations: string = '',
		quantity: number = 1,
		deliveryDate: Date = new Date(),
		partsToCalculate: PreCalculatedItemPart[] = [],
		extraParts: CalculatedItemPart[] = [],
		discount: number = 0
	): Promise<ItemResponse | null> {
		const verifierdOrder = await this.verifyOrder(orderId);
		if (!verifierdOrder) return null;
		const item: Item = {
			id: uuidv4(),
			orderId,
			width,
			height,
			passePartoutWidth,
			passePartoutHeight,
			description,
			observations,
			quantity,
			createdAt: new Date(),
			deliveryDate,
			partsToCalculate: partsToCalculate,
			deleted: false
		};
		
		ItemService.verifyItem(item);
		const calculatedItem = await this.calculatedItemService.createCalculatedItem(
			item,
			discount,
			extraParts
		);
		return { itemInfo: item, calculatedItem };
	}

	public async saveItem(item: Item, calculatedItem: CalculatedItem): Promise<void> {
		await this.itemRepository.createItem(ItemService.toDto(item));
		await this.calculatedItemService.saveCalculatedItem(calculatedItem);
	}

	public async deleteItem(item: Item): Promise<void> {
		item.deleted = true;
		await this.itemRepository.setItemDeleted(true, ItemService.toDto(item));
	}

	private async verifyOrder(orderId?: string, paramOrder?: Order): Promise<Order | null> {
		let order;
		if (orderId && !paramOrder) {
			order = await this.orderService.getOrderById(orderId);
		} else if (paramOrder && !orderId) {
			order = paramOrder;
		}

		return !order || order.storeId !== this.storeId ? null : order;
	}

	private static verifyItem(item: Item) {
		// Method that check that all fields are not null and not undefined
		if (
			!item.id ||
			!item.orderId ||
			!item.width ||
			!item.height ||
			!item.quantity ||
			!item.createdAt
		) {
			console.log(item);
			throw new InvalidDataError('Invalid item data');
		}

		for (const part of item.partsToCalculate) {
			if (!part.id || !part.quantity || !part.type) {
				throw new InvalidDataError('Invalid item data');
			}

			if (part.type === PricingType.PP && (item.passePartoutWidth == null || item.passePartoutHeight == null)) {
				throw new InvalidDataError('Invalid item PP data');
			}
		}
	}

	private static toDto(item: Item): ItemDto {
		return {
			itemUuid: item.id,
			orderUuid: item.orderId,
			width: item.width,
			height: item.height,
			passePartoutWidth: item.passePartoutWidth,
			passePartoutHeight: item.passePartoutHeight,
			description: item.description,
			observations: item.observations,
			quantity: item.quantity,
			createdAt: Date.parse(item.createdAt.toISOString()),
			deliveryDate: Date.parse(item.deliveryDate.toISOString()),
			deleted: item.deleted,
			partsToCalculate: item.partsToCalculate.map((part) => ({
				id: part.id,
				quantity: part.quantity,
				type: part.type as string
			}))
		};
	}

	private static fromDto(dto: ItemDto): Item {
		return {
			id: dto.itemUuid,
			orderId: dto.orderUuid,
			width: dto.width,
			height: dto.height,
			passePartoutWidth: dto.passePartoutWidth,
			passePartoutHeight: dto.passePartoutHeight,
			description: dto.description,
			observations: dto.observations,
			quantity: dto.quantity,
			createdAt: new Date(dto.createdAt),
			deliveryDate: new Date(dto.deliveryDate),
			deleted: dto.deleted,
			partsToCalculate: dto.partsToCalculate.map((part) => ({
				id: part.id,
				quantity: part.quantity,
				type: part.type as PricingType
			}))
		};
	}
}

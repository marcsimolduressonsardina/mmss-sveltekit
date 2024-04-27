export type CalculatedItemDto = {
	orderUuid: string;
	discount: number;
	parts: CalculatedItemPartDto[];
	total: number;
	quantity: number;
};

export type CalculatedItemPartDto = {
	priceId: string;
	price: number;
	quantity: number;
	description: string;
	log?: string;
};

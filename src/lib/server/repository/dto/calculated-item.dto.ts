export type CalculatedItemDto = {
	orderUuid: string;
	discount: number;
	parts: CalculatedItemPartDto[];
	total: number;
};

export type CalculatedItemPartDto = {
	price: number;
	quantity: number;
	description: string;
	log?: string;
};

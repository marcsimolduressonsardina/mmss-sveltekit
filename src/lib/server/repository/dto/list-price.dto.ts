export type MaxAreaDto = {
	d1: number;
	d2: number;
	price: number;
};

export type ListPriceDto = {
	id: string;
	uuid: string,
	price: number;
	description: string;
	type: string;
	formula: string;
	areas: MaxAreaDto[];
	maxD1?: number;
	maxD2?: number;
};

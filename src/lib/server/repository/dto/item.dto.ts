export type PreCalculatedItemPartDto = {
	type: string;
	id: string;
	quantity: number;
};

export type PPDimensionsDto = {
	up: number;
	down: number;
	left: number;
	right: number;
};

export type ItemDto = {
	width: number;
	height: number;
	pp: number;
	ppDimensions?: PPDimensionsDto;
	description: string;
	predefinedObservations: string[];
	observations: string;
	quantity: number;
	createdAt: number;
	deliveryDate: number;
	partsToCalculate: PreCalculatedItemPartDto[];
	exteriorWidth?: number;
	exteriorHeight?: number;
};

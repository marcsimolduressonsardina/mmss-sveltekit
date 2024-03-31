export type PreCalculatedItemPartDto = {
	type: string;
	id: string;
	quantity: number;
};

export type ItemDto = {
	itemUuid: string;
	orderUuid: string;
	width: number;
	height: number;
	passePartoutWidth: number;
	passePartoutHeight: number;
	description: string;
	predefinedObservations: string[];
	observations: string;
	quantity: number;
	createdAt: number;
	deliveryDate: number;
	partsToCalculate: PreCalculatedItemPartDto[];
	deleted: boolean;
};

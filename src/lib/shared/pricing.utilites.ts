import type { ListPrice } from '$lib/type/api.type';
import { PricingFormula, PricingType } from '$lib/type/pricing.type';
import { z } from 'zod';

export type AllPrices = {
	moldPrices: ListPrice[];
	glassPrices: ListPrice[];
	ppPrices: ListPrice[];
	backPrices: ListPrice[];
	otherPrices: ListPrice[];
};

export const emptyPricing: AllPrices = {
	moldPrices: [],
	glassPrices: [],
	ppPrices: [],
	backPrices: [],
	otherPrices: []
};

export type EditablePricingTypes =
	| PricingType.BACK
	| PricingType.GLASS
	| PricingType.PP
	| PricingType.OTHER;

export const pricingTypesMap: Record<EditablePricingTypes, string> = {
	[PricingType.GLASS]: 'Cristal',
	[PricingType.PP]: 'PP',
	[PricingType.OTHER]: 'Otro',
	[PricingType.BACK]: 'Trasera'
};

export const formulasMap: Record<PricingFormula, string> = {
	[PricingFormula.NONE]: 'Precio unitario sin cálculos',
	[PricingFormula.FORMULA_AREA]: 'Precio por m2',
	[PricingFormula.FORMULA_FIT_AREA]: 'Precio por trozos',
	[PricingFormula.FORMULA_LEFTOVER]: 'Precio con fórmula m2 * precio * IVA * 5 + 2'
};

const areaSchema = z.object({
	d1: z.number().min(1.0),
	d2: z.number().min(1.0),
	price: z.number().min(0)
});

const listPriceSchema = {
	id: z
		.string()
		.regex(/^[^\s]*$/, 'id should not contain spaces')
		.min(1),
	price: z.number().min(0),
	description: z.string().min(1),
	type: z.enum([PricingType.GLASS, PricingType.PP, PricingType.BACK, PricingType.OTHER]),
	formula: z.enum([
		PricingFormula.FORMULA_LEFTOVER,
		PricingFormula.FORMULA_FIT_AREA,
		PricingFormula.FORMULA_AREA,
		PricingFormula.NONE
	]),
	areas: z.array(areaSchema).default([]),
	maxD1: z.number().optional(),
	maxD2: z.number().optional()
};

export const listPriceSchemaNew = z.object({
	...listPriceSchema,
	type: z.enum([PricingType.GLASS, PricingType.PP, PricingType.BACK, PricingType.OTHER])
});

export const listPriceSchemaEdit = z.object({
	...listPriceSchema,
	type: z.enum([PricingType.GLASS, PricingType.PP, PricingType.BACK, PricingType.OTHER, PricingType.MOLD])
});


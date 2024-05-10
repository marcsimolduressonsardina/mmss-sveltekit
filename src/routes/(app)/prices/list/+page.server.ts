import type { PageServerLoad } from './$types';
import { PricingHelper } from '$lib/server/shared/pricing/pricing.helper';
import { AuthUtilities } from '$lib/shared/auth.utilites';
import { PricingType } from '$lib/type/pricing.type';

function getPricingType(value?: string): PricingType {
	if (!Object.values(PricingType).includes(value as PricingType) || value === PricingType.FABRIC) {
		return PricingType.MOLD;
	}

	return value as PricingType;
}

export const load = (async ({ locals, url }) => {
	const type = url.searchParams.get('type') ?? PricingType.MOLD;
	const pricingType = getPricingType(type);

	await AuthUtilities.checkAuth(locals);
	return { pricing: PricingHelper.getPricing(), pricingType };
}) satisfies PageServerLoad;

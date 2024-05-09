import type { PageServerLoad } from './$types';
import { PricingHelper } from '$lib/server/shared/pricing/pricing.helper';
import { AuthUtilities } from '$lib/shared/auth.utilites';

export const load = (async ({ locals }) => {
	await AuthUtilities.checkAuth(locals);
	return { pricing: PricingHelper.getPricing() };
}) satisfies PageServerLoad;

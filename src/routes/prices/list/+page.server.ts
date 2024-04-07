import { AuthService } from '$lib/server/service/auth.service';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PricingHelper } from '$lib/server/shared/pricing/pricing.helper';

export const load = (async ({ locals }) => {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session?.user);
	if (!appUser) throw redirect(303, '/auth/signin');
	return { pricing: PricingHelper.getPricing() };
}) satisfies PageServerLoad;

import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const user = await AuthUtilities.checkAuth(locals);
	return { canEditPricing: user.priceManager };
}) satisfies LayoutServerLoad;

import type { PageServerLoad } from './$types';
import { AuthUtilities } from '$lib/shared/auth.utilites';

export const load = (async ({ locals }) => {
	await AuthUtilities.checkAuth(locals);
}) satisfies PageServerLoad;

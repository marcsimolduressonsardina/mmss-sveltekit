import { MAINTENANCE_MODE } from '$env/static/private';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const user = await AuthUtilities.checkAuth(locals);
	const inMaintenance = MAINTENANCE_MODE === 'yes';
	return { user, inMaintenance };
}) satisfies LayoutServerLoad;

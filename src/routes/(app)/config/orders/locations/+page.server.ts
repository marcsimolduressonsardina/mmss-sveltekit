import { ConfigService } from '$lib/server/service/config.service';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { error, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals, true);
	const configService = new ConfigService(appUser);
	const locations = await configService.getLocationsList();
	return { locations };
}) satisfies PageServerLoad;

export const actions: Actions = {
	saveLocations: async ({ locals, request }) => {
		const appUser = await AuthUtilities.checkAuth(locals, true);
		if (!appUser.priceManager) {
			throw error(403);
		}

		const formData = await request.formData();
		const locations = formData.get('locations');

		const locationsArray = JSON.parse(locations as string) as string[];
		const configService = new ConfigService(appUser);
		await configService.storeLocationsList(locationsArray);
		return redirect(302, '/config');
	}
};

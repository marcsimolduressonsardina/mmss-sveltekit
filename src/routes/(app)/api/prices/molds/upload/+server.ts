import { json } from '@sveltejs/kit';
import { AuthService } from '$lib/server/service/auth.service';
import { MoldPriceLoader } from '$lib/server/data/mold-price.loader';
import type { CustomSession } from '$lib/type/api.type.js';

const moldPriceLoader = new MoldPriceLoader();

export async function GET({ locals }) {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session as CustomSession);
	if (!appUser || !appUser.priceManager) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { filename, url } = await moldPriceLoader.generateFileUploadUrl();
	return json({ filename, url });
}

export async function POST({ request, locals }) {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session as CustomSession);
	if (!appUser || !appUser.priceManager) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { filename } = (await request.json()) as { filename: string };
	if (filename == null) {
		return json({ error: 'Filename is required' }, { status: 400 });
	}

	try {
		await moldPriceLoader.loadMoldPrices(filename);
	} catch (error: unknown) {
		console.error(error);
		return json({ error: 'Error loading the prices' }, { status: 500 });
	}

	return json({ success: true });
}

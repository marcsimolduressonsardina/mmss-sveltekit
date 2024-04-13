import type { PreCalculatedItemPartRequest } from '$lib/type/api.type';
import { json } from '@sveltejs/kit';
import { CalculatedItemService } from '../../../lib/server/service/calculated-item.service';
import { AuthService } from '$lib/server/service/auth.service';
import { InvalidSizeError } from '$lib/server/error/invalid-size.error';

const calculatedItemService = new CalculatedItemService();

export async function POST({ request, locals }) {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session?.user);
	if (!appUser) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const pricingRequest = (await request.json()) as PreCalculatedItemPartRequest;

	try {
		const part = await calculatedItemService.calculatePart(
			pricingRequest.partToCalculate,
			pricingRequest.width,
			pricingRequest.height
		);

		return json(part);
	} catch (error: unknown) {
		if (error instanceof InvalidSizeError) {
			return json({ error: error.message }, { status: 400 });
		}

		console.log(error);

		return json({ error: 'Error computing the price' }, { status: 500 });
	}
}

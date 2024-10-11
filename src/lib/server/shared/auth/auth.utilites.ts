import { redirect } from '@sveltejs/kit';
import { AuthService } from '$lib/server/service/auth.service';
import type { CustomSession } from '$lib/type/api.type';
import type { AppUser } from '@marcsimolduressonsardina/core';

export class AuthUtilities {
	public static async checkAuth(
		locals: App.Locals,
		checkPricing: boolean = false
	): Promise<AppUser> {
		const session = (await locals.auth()) as CustomSession;
		const appUser = AuthService.generateUserFromAuth(session);
		if (!appUser) throw redirect(303, '/auth/signin?callbackUrl=/');
		if (checkPricing) {
			AuthUtilities.checkCanEditPricing(appUser);
		}
		return appUser;
	}

	public static checkCanEditPricing(user: AppUser) {
		if (!user.priceManager) {
			throw redirect(303, '/');
		}
	}
}

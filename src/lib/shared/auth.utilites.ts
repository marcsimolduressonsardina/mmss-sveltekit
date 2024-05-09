import { redirect } from '@sveltejs/kit';
import { AuthService } from '$lib/server/service/auth.service';
import type { AppUser } from '$lib/type/api.type';


export class AuthUtilities {
	public static async checkAuth(locals: App.Locals): Promise<AppUser> {
		const session = await locals.auth();
		const appUser = AuthService.generateUserFromAuth(session?.user);
		if (!appUser) throw redirect(303, '/auth/signin?callbackUrl=/');
        return appUser
	}
}

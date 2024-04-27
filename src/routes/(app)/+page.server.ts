import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { AuthService } from '$lib/server/service/auth.service';

export const load = (async ({ locals }) => {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session?.user);
	if (!appUser) throw redirect(303, '/auth/signin');
}) satisfies PageServerLoad;

import { SvelteKitAuth, type SvelteKitAuthConfig } from '@auth/sveltekit';
import Auth0Provider from '@auth/core/providers/auth0';
import type { Provider } from '@auth/core/providers';
import type { Handle } from '@sveltejs/kit';
import { env } from "$env/dynamic/private";

const config: SvelteKitAuthConfig = {
	providers: [
		Auth0Provider({
			id: 'auth0',
			name: 'Auth0',
			clientId: env['AUTH0_CLIENT_ID'],
			clientSecret: env['AUTH0_CLIENT_SECRET'],
			issuer: env['AUTH0_DOMAIN'],
			wellKnown: env['AUTH0_DOMAIN'] + '.well-known/openid-configuration'
		}) as Provider
	],
	secret: '-any-random-string-',
	debug: true,
	session: {
		maxAge: 60 * 60 * 24 // 30 mins
	}
};

export const handle = SvelteKitAuth(config).handle satisfies Handle;

import { SvelteKitAuth, type SvelteKitAuthConfig } from '@auth/sveltekit';
import Auth0Provider from '@auth/core/providers/auth0';
import type { Provider } from '@auth/core/providers';
import type { Handle } from '@sveltejs/kit';
import {
	AUTH0_CLIENT_ID,
	AUTH0_CLIENT_SECRET,
	AUTH0_URL,
	AUTH_SECRET,
	AUTH_DEBUG
} from '$env/static/private';

const config: SvelteKitAuthConfig = {
	basePath: '/auth',
	providers: [
		Auth0Provider({
			id: 'auth0',
			name: 'Auth0',
			clientId: AUTH0_CLIENT_ID,
			clientSecret: AUTH0_CLIENT_SECRET,
			issuer: AUTH0_URL,
			wellKnown: `${AUTH0_URL}.well-known/openid-configuration`
		}) as Provider
	],
	secret: AUTH_SECRET,
	debug: AUTH_DEBUG === 'debug',
	session: {
		maxAge: 60 * 60 * 24 // 30 mins
	}
};

export const handle = SvelteKitAuth(config).handle satisfies Handle;

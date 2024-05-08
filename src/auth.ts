import { SvelteKitAuth } from '@auth/sveltekit';
import Auth0 from '@auth/sveltekit/providers/auth0';
import type { Provider } from '@auth/sveltekit/providers';
import { AUTH_DEBUG } from '$env/static/private';

const providers: Provider[] = [Auth0];

export const { handle } = SvelteKitAuth({
	providers,
	trustHost: true,
	debug: AUTH_DEBUG === 'debug'
});

import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_DOMAIN_URL, PUBLIC_SENTRY_DSN } from '$env/static/public';
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: PUBLIC_SENTRY_DSN,
	tracesSampleRate: 1,
	environment: PUBLIC_DOMAIN_URL
});

import { authHandle } from './auth';
export const handleError = Sentry.handleErrorWithSentry();
export const handle = sequence(Sentry.sentryHandle(), authHandle);

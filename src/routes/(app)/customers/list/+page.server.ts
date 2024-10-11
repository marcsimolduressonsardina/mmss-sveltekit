import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { CustomerService } from '@marcsimolduressonsardina/core';
import { AuthService } from '$lib/server/service/auth.service';

export const load = (async ({ locals, url }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	if (!appUser.priceManager) {
		throw error(403);
	}

	const currentKey = url.searchParams.get('next') ?? undefined;
	const historyStackString = url.searchParams.get('history');
	const historyStack: string[] = historyStackString ? JSON.parse(atob(historyStackString)) : [];

	const nextHistoryStack = [...historyStack, currentKey].filter((k) => k != null);
	const nextHistoryStackString = btoa(JSON.stringify(nextHistoryStack));

	const prevHistoryStack = historyStack.length > 0 ? historyStack.slice(0, -1) : [];
	const prevHistoryStackString = btoa(JSON.stringify(prevHistoryStack));
	const prev = historyStack.length > 0 ? historyStack[historyStack.length - 1] : undefined;

	const customerService = new CustomerService(AuthService.generateConfiguration(appUser));
	const paginatedResult = customerService.getAllCustomersPaginated(currentKey);
	return {
		paginatedResult,
		nextHistoryStackString,
		prev,
		prevHistoryStackString,
		isFirstPage: currentKey == null
	};
}) satisfies PageServerLoad;

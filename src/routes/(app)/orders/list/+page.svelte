<script lang="ts">
	import type { PageData } from './$types';

	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import OrderCard from '$lib/components/OrderCard.svelte';
	import { Icon } from 'svelte-awesome';
	import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
	import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons/faClockRotateLeft';
	import { orderStatusMap } from '$lib/shared/order.utilities';
	import { OrderStatus } from '$lib/type/order.type';
	import type { OrderFromList } from '$lib/type/api.type';

	export let data: PageData;
	let searchValue = '';

	function normalizeString(str: string): string {
		return str
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLocaleLowerCase();
	}

	function getStatus(statusStr: string) {
		const status = statusStr as OrderStatus;
		return orderStatusMap[status];
	}

	function isWordPresent(inputString1: string, inputString2: string): boolean {
		// Normalize input strings to ensure consistent comparison
		const normalizedInputString1 = normalizeString(inputString1);
		const normalizedInputString2 = normalizeString(inputString2);

		// Split normalized input strings into arrays of words
		const words1 = normalizedInputString1.split(' ');
		const words2 = normalizedInputString2.split(' ');

		// Iterate over each word in the first input string
		for (const word1 of words1) {
			// Check if the current word is present or partially present in the second input string
			if (words2.some((word2) => word2.includes(word1))) {
				return true; // If found, return true
			}
		}

		return false; // If no match is found, return false
	}

	function filterOrders(orders: OrderFromList[], search: string): OrderFromList[] {
		if (searchValue.length === 0) {
			return orders;
		}

		return orders.filter((o) => isWordPresent(search, o.item.description));
	}
</script>

<div class="space flex w-full flex-col gap-1 p-3">
	{#await data.orders}
		<ProgressBar />
	{:then orders}
		<span class="pb-1 text-xl font-medium text-gray-700">Pedidos {getStatus(data.status)}s</span>

		<div
			class="flex w-full flex-col place-content-center items-center justify-center gap-1 md:grid md:grid-cols-2"
		>
			<a
				class="variant-ghost-primary btn btn-sm w-full"
				href={`/orders/list?status=${OrderStatus.FINISHED}`}
			>
				<Icon class="mr-1" data={faCheck} /> Ver pedidos finalizados
			</a>
			<a
				class="variant-ghost btn btn-sm w-full"
				href={`/orders/list?status=${OrderStatus.PENDING}`}
			>
				<Icon class="mr-1" data={faClockRotateLeft} /> Ver pedidos pendientes
			</a>
		</div>
		<div
			class="mb-3 mt-3 flex w-full flex-col place-content-center items-center justify-center gap-1"
		>
			<input
				bind:value={searchValue}
				class="input"
				type="text"
				placeholder="Buscar en descripción..."
			/>
		</div>

		<div class="flex w-full flex-col gap-1 lg:grid lg:grid-cols-4">
			{#each filterOrders(orders, searchValue) as order}
				<OrderCard {order} />
			{/each}
		</div>
	{/await}
</div>

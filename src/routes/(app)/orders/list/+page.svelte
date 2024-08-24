<script lang="ts">
	import type { PageData } from './$types';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import OrderCard from '$lib/components/order/OrderCard.svelte';
	import { Icon } from 'svelte-awesome';
	import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
	import { faClipboardList } from '@fortawesome/free-solid-svg-icons/faClipboardList';
	import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons/faClockRotateLeft';
	import { orderStatusMap } from '$lib/shared/order.utilities';
	import { OrderStatus } from '$lib/type/order.type';
	import type { Order } from '$lib/type/api.type';
	import Box from '$lib/components/Box.svelte';

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
		const name = orderStatusMap[status];
		if (status === OrderStatus.QUOTE) {
			return `Listado de ${name}s`;
		} else {
			return `Pedidos ${name}s`;
		}
	}

	function isWordPresent(inputString1: string, inputString2: string): boolean {
		const normalizedInputString1 = normalizeString(inputString1);
		const normalizedInputString2 = normalizeString(inputString2);

		const words1 = normalizedInputString1.split(' ');
		const words2 = normalizedInputString2.split(' ');

		for (const word1 of words1) {
			if (words2.some((word2) => word2.includes(word1))) {
				return true;
			}
		}

		return false;
	}

	function filterOrders(orders: Order[], search: string): Order[] {
		if (searchValue.length === 0) {
			return orders;
		}

		return orders.filter((o) => isWordPresent(search, o.item.description));
	}
</script>

<div class="space flex w-full flex-col gap-4 p-3">
	{#await data.orders}
		<Box title={''}>
			<ProgressBar />
		</Box>
	{:then orders}
		<Box title={`${getStatus(data.status)}`}>
			<div
				class="flex w-full flex-col place-content-center items-center justify-center gap-3 md:grid md:grid-cols-3"
			>
				<a
					class="w-full rounded-md bg-green-700 px-4 py-2 text-center font-semibold text-white shadow hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
					href={`/orders/list?status=${OrderStatus.FINISHED}`}
				>
					<Icon class="mr-1" data={faCheck} /> Ver pedidos finalizados
				</a>
				<a
					class="w-full rounded-md bg-gray-700 px-4 py-2 text-center font-semibold text-white shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
					href={`/orders/list?status=${OrderStatus.PENDING}`}
				>
					<Icon class="mr-1" data={faClockRotateLeft} /> Ver pedidos pendientes
				</a>
				<a
					class="w-full rounded-md bg-purple-700 px-4 py-2 text-center font-semibold text-white shadow hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
					href={`/orders/list?status=${OrderStatus.QUOTE}`}
				>
					<Icon class="mr-1" data={faClipboardList} /> Ver presupuestos
				</a>
			</div>
			<div class="mt-4">
				<input
					bind:value={searchValue}
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
					type="text"
					placeholder="Buscar en descripción..."
				/>
			</div>
		</Box>

		<div class="flex w-full flex-col gap-3 lg:grid lg:grid-cols-4">
			{#each filterOrders(orders, searchValue) as order}
				<OrderCard {order} />
			{/each}
		</div>
	{/await}
</div>

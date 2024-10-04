<script lang="ts">
	import type { PageData } from './$types';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import OrderCard from '$lib/components/order/OrderCard.svelte';
	import { orderStatusMap } from '$lib/shared/order.utilities';
	import { OrderStatus } from '$lib/type/order.type';
	import type { FullOrder } from '$lib/type/api.type';
	import Box from '$lib/components/Box.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import { getStatusUIInfo } from '$lib/ui/ui.helper';

	export let data: PageData;
	let searchValue = '';
	let timer: NodeJS.Timeout;
	let searchOrders: FullOrder[] = [];
	let loading = false;

	function getStatus(statusStr: string) {
		const status = statusStr as OrderStatus;
		const name = orderStatusMap[status];
		if (status === OrderStatus.QUOTE) {
			return `Listado de ${name}s`;
		} else {
			return `Pedidos ${name}s`;
		}
	}

	async function search(query: string): Promise<FullOrder[]> {
		if (query.length < 3) {
			return [];
		}

		const response = await fetch('/api/orders/search', {
			method: 'POST',
			body: JSON.stringify({ query, status: data.status }),
			headers: {
				'content-type': 'application/json'
			}
		});

		const body: { results: FullOrder[] } = await response.json();
		return body.results.map((fo) => ({
			calculatedItem: fo.calculatedItem,
			order: {
				...fo.order,
				item: {
					...fo.order.item,
					deliveryDate: new Date(fo.order.item.deliveryDate)
				},
				createdAt: new Date(fo.order.createdAt)
			}
		}));
	}

	const debounce = (v: string) => {
		clearTimeout(timer);
		loading = true;
		searchOrders = [];
		timer = setTimeout(async () => {
			searchOrders = await search(v);
			loading = false;
		}, 400);
	};
</script>

<div class="space flex w-full flex-col gap-4 p-3">
	<Box title={`${getStatus(data.status)}`}>
		{#if data.status !== OrderStatus.QUOTE}
			<div
				class="flex w-full flex-col place-content-center items-center justify-center gap-3 md:grid md:grid-cols-2"
			>
				<Button
					text="Ver pedidos finalizados"
					link={`/orders/list?status=${OrderStatus.FINISHED}`}
					colorClasses={getStatusUIInfo(OrderStatus.FINISHED).colors}
					icon={getStatusUIInfo(OrderStatus.FINISHED).statusIcon}
				></Button>

				<Button
					text="Ver pedidos pendientes"
					link={`/orders/list?status=${OrderStatus.PENDING}`}
					colorClasses={getStatusUIInfo(OrderStatus.PENDING).colors}
					icon={getStatusUIInfo(OrderStatus.PENDING).statusIcon}
				></Button>
			</div>
		{/if}

		<div class="mt-4">
			<input
				bind:value={searchValue}
				on:keyup={() => debounce(searchValue)}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
				type="text"
				placeholder="Buscar en descripción..."
			/>
		</div>
	</Box>

	{#if searchValue.length === 0}
		{#await data.orders}
			<ProgressBar text="Cargando listado" />
		{:then fullOrders}
			<div class="flex w-full flex-col gap-3 lg:grid lg:grid-cols-4">
				{#each fullOrders as fullOrder}
					<OrderCard {fullOrder} />
				{/each}
			</div>
		{/await}
	{/if}

	{#if searchValue.length > 0}
		{#if searchValue.length < 3}
			<div class="w-full text-center">Escribe más de 3 carácteres</div>
		{:else if loading}
			<ProgressBar text="Buscando" />
		{:else}
			<div class="flex w-full flex-col gap-3 lg:grid lg:grid-cols-4">
				{#each searchOrders as fullOrder}
					<OrderCard {fullOrder} />
				{/each}
			</div>
		{/if}
	{/if}
</div>

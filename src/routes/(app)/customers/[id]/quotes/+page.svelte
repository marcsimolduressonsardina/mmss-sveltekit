<script lang="ts">
	import type { PageData } from './$types';

	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import OrderCard from '$lib/components/order/OrderCard.svelte';

	export let data: PageData;
</script>

<div class="p-3 text-xl font-medium">
	Presupuestos de {data.customer?.name}
</div>

<div
	class="w-full place-content-center space-y-2 px-2 pt-3 lg:grid lg:grid-cols-4 lg:gap-4 lg:space-y-0"
>
	{#await data.orders}
		<div class="lg:col-span-4">
			<ProgressBar />
		</div>
	{:then orders}
		{#if orders == null}
			<p class="text-3xl">Cliente no encontrado</p>
			<a href="/customers/search" class="variant-filled-primary btn btn-xl w-full lg:w-auto"
				>Buscar cliente</a
			>
		{:else if orders.length === 0}
			<p class="text-xl">El cliente no tiene presupuestos</p>
		{:else}
			{#each orders as order (order.id)}
				<OrderCard {order} showCustomer={false} />
			{/each}
		{/if}
	{:catch error}
		<h5 class="h5">Error obteniendo los pedidos</h5>
	{/await}
</div>

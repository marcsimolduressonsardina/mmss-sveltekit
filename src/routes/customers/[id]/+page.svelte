<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';
	import { faUser } from '@fortawesome/free-regular-svg-icons/faUser';
	import plus from 'svelte-awesome/icons/plus';

	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="flex w-full flex-col place-content-center space-y-2 px-2 pt-3 text-center">
	{#await data.customer}
		<ProgressBar />
	{:then customer}
		{#if customer == null}
			<p class="text-3xl">Cliente no encontrado</p>
			<a href="/customers/search" class="variant-filled-primary btn btn-xl w-full lg:w-auto"
				>Buscar cliente</a
			>
		{:else}
			<div class="flex items-center space-x-4 rounded-md bg-slate-50 p-5 shadow-sm">
				<Icon class="font-semibold text-gray-700" scale={3} data={faUser} />
				<div class="grid grid-cols-1">
					<span class="text-lg font-semibold text-gray-700">{customer.name}</span>
					<span class="text-sm text-gray-500">{customer.phone}</span>
				</div>
			</div>

			<div
				class="flex w-full flex-col place-content-center space-y-2 pt-2 lg:flex-row lg:space-x-2 lg:space-y-0"
			>
				<a
					class="variant-filled-warning btn btn-xl w-full shadow-sm lg:btn-md"
					href="/customers/{customer.id}/orders/new"
				>
					<Icon class="mr-2" data={plus} /> Crear pedido
				</a>
				<a
					href="/customers/{customer.id}/orders"
					class="variant-filled btn btn-xl shadow-sm lg:btn-md lg:w-full"
				>
					<Icon class="mr-2" data={faBox} /> Ver pedidos
				</a>
			</div>
		{/if}
	{/await}
</div>

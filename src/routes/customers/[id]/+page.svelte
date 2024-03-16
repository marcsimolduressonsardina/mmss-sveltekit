<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';
	import { faUser } from '@fortawesome/free-regular-svg-icons/faUser';
	import plus from 'svelte-awesome/icons/plus';

	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	let isLoading = false;
	let formElement: HTMLFormElement;

	async function handleSubmit() {
		isLoading = true;
		formElement.submit();
	}
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
				{#if isLoading}
					<ProgressBar text={'Generando el pedido...'} />
				{:else}
					<form
						class="lg:w-full"
						on:submit|preventDefault={handleSubmit}
						bind:this={formElement}
						method="post"
						action="?/createOrder"
					>
						<button class="variant-filled-warning btn btn-xl w-full shadow-sm lg:btn-md"
							><Icon class="mr-2" data={plus} /> Crear pedido
						</button>
					</form>
					<a
						href="/customers/{customer.id}/orders"
						class="variant-filled btn btn-xl shadow-sm lg:btn-md lg:w-full"
						><Icon class="mr-2" data={faBox} /> Ver pedidos</a
					>
				{/if}
			</div>
			{#if form?.missing}
				<p class="p-5 text-lg font-semibold text-red-700">
					No se ha podido crear el pedido, inténtelo más tarde.
				</p>
			{/if}
		{/if}
	{/await}
</div>

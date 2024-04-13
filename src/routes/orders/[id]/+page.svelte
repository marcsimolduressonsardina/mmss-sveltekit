<script lang="ts">
	import type { PageData } from './$types';
	import { Icon } from 'svelte-awesome';
	import { faImage } from '@fortawesome/free-solid-svg-icons/faImage';
	import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint';
	import { faBook } from '@fortawesome/free-solid-svg-icons/faBook';
	import plus from 'svelte-awesome/icons/plus';
	import trash from 'svelte-awesome/icons/trash';

	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import OrderId from '$lib/components/OrderId.svelte';
	import { isOrderTemp } from '$lib/shared/order.utilities';

	export let data: PageData;
</script>

<div class="flex w-full flex-col place-content-center space-y-2 px-2 py-3">
	{#await data.order}
		<ProgressBar />
	{:then order}
		{#if order == null}
			<span class="p-5 text-2xl text-red-700">Cliente o pedido no encontrado</span>
		{:else if isOrderTemp(order)}
			<span class="p-5 text-xl">Rellene los datos del cliente por favor</span>
			
		{:else}
			<div class="flex w-full flex-col">
				<span class="text-xl text-gray-700">{order.customer.name}</span>
				<span class="text-sm"> <OrderId {order} /></span>
				<span class="text-md text-gray-700">{new Date(order.createdAt).toLocaleString()}</span>
				<span class="text-md text-gray-700">Creado por {order.userName}</span>
				<div class="flex w-full flex-col space-y-1 md:flex-row md:space-x-1 md:space-y-0">
					<button class="variant-filled-success btn btn-sm md:w-1/3"
						><Icon class="mr-1" data={faPrint} />Imprimir pedido</button
					>
					<form class="w-full md:w-1/3" method="post" action="?/deleteOrder">
						<button class="variant-filled-error btn btn-sm w-full"
							><Icon class="mr-1" data={trash} />Eliminar pedido</button
						>
					</form>
					<a class="variant-filled-warning btn btn-sm md:w-1/3" href="/orders/{order.id}/items/new"
						><Icon class="mr-1" data={plus} />Nuevo ítem</a
					>
				</div>
			</div>
		{/if}
	{/await}
</div>

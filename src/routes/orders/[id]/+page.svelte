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

	export let data: PageData;
</script>

<div class="flex w-full flex-col place-content-center space-y-2 px-2 py-3">
	{#await data.order}
		<ProgressBar />
	{:then order}
		{#if order == null}
			<span class="p-5 text-2xl text-red-700">Cliente o pedido no encontrado</span>
		{:else}
			<!-- <div class="text-center	">
				<a class="variant-filled btn" href={`/orders/${order.id}/items/new`}><Icon data={plus} /></a
			>
			</div> -->
			<div class="flex w-full flex-col">
				<span class="text-xl text-gray-700">{order.customer.name}</span>
				<span class="text-sm"> <OrderId {order} /></span>
				<span class="text-md text-gray-700">{new Date(order.createdAt).toLocaleString()}</span>
				<span class="text-md text-gray-700">Creado por {order.userName}</span>
				{#await data.items}
					<ProgressBar />
				{:then items}
					{#if items == null || items.length === 0}
						<p class="p text-gray-700">No hay elementos en este pedido</p>
					{:else}
						{#each items as item, index}
							<div
								class="mt-1 flex w-full flex-col rounded-md bg-slate-50 p-3 text-gray-700 shadow-sm"
							>
								<span class="text-md flex font-semibold">
									<Icon data={faImage} class="mr-2" /> Item {index + 1}/{items.length}

									<span class="ml-auto text-sm">x{item.itemInfo.quantity}</span>
								</span>
								<span class="text-sm"
									>Entrega: {new Date(item.itemInfo.deliveryDate).toLocaleDateString('es-ES')}
								</span>
								<span class="text-sm">Total: {item.calculatedItem.total.toFixed(2)} € </span>
								<div class="flex w-full flex-col space-y-1 md:flex-row md:space-x-1 md:space-y-0">
									<button class="variant-filled btn btn-sm md:w-1/3"
										><Icon class="mr-1" data={faBook} /> Ver detalle</button
									>
									<button class="variant-filled-success btn btn-sm md:w-1/3"
										><Icon class="mr-1" data={faPrint} />Imprimir</button
									>
									<form class="md:w-1/3" method="post" action="?/deleteItem">
										<input type="hidden" name="itemId" value={item.itemInfo.id} />
										<button class="variant-filled-error btn btn-sm w-full"
										><Icon class="mr-1" data={trash} />Eliminar</button
									>
									</form>
									
								</div>
							</div>
						{/each}
					{/if}
				{/await}
			</div>
		{/if}
	{/await}
</div>

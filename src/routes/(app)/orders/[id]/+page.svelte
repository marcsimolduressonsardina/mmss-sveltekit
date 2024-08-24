<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Icon } from 'svelte-awesome';
	import { faCamera } from '@fortawesome/free-solid-svg-icons/faCamera';
	import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint';
	import trash from 'svelte-awesome/icons/trash';

	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { isOrderTemp } from '$lib/shared/order.utilities';
	import { OrderStatus } from '$lib/type/order.type';
	import OrderButtons from '$lib/components/order/OrderButtons.svelte';
	import QuoteButtons from '$lib/components/order/QuoteButtons.svelte';
	import OrderInfo from '$lib/components/order/OrderInfo.svelte';
	import OrderElements from '$lib/components/order/OrderElements.svelte';
	import OrderHeader from '$lib/components/order/OrderHeader.svelte';

	let formLoading = false;

	function setFormLoading(value: boolean) {
		formLoading = value;
	}

	export let data: PageData;
</script>

{#await data.info}
	<ProgressBar />
{:then info}
	<div class="space flex w-full flex-col p-3">
		{#if info.order == null || info.calculatedItem == null}
			<span class="p-5 text-2xl text-red-700">Cliente o pedido no encontrado</span>
		{:else if isOrderTemp(info.order)}
			{goto(`/orders/${info.order.id}/link`)}
		{:else}
			<OrderHeader order={info.order} calculatedItem={info.calculatedItem}></OrderHeader>

			{#if !formLoading}
				<div
					class="flex w-full flex-col place-content-center items-center justify-center gap-1 pt-4 md:grid md:grid-cols-2 lg:grid-cols-3"
				>
					<a
						class="flex w-full items-center justify-center rounded-md bg-yellow-500 px-4 py-2 text-white shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2"
						target="_blank"
						href={`/orders/${info.order.id}/print`}
					>
						<Icon class="mr-2" data={faPrint} /> Imprimir
					</a>

					{#if info.order.status === OrderStatus.QUOTE}
						<QuoteButtons order={info.order}></QuoteButtons>
					{:else}
						<OrderButtons
							order={info.order}
							calculatedItem={info.calculatedItem}
							{formLoading}
							{setFormLoading}
						></OrderButtons>
					{/if}
				</div>
			{/if}

			{#if formLoading}
				<span class="pt-4"> <ProgressBar text={'Aplicando cambios...'} /> </span>
			{/if}

			<div class="flex w-full flex-col gap-1">
				<hr class="mb-3 mt-2 border-t border-gray-200 lg:col-span-2" />
				<div class="flex w-full flex-col gap-2">
					<button
						class="w-full rounded-md bg-orange-500 px-4 py-2 text-lg text-white shadow hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2"
						on:click={() => {
							goto(`/orders/${info?.order?.id}/files`);
						}}
					>
						<Icon class="mr-2" data={faCamera} /> Cámara
					</button>
				</div>

				<span class="pt-4"> <OrderInfo order={info.order}></OrderInfo> </span>

				<span class="pt-4">
					<OrderElements order={info.order} calculatedItem={info.calculatedItem}></OrderElements>
				</span>

				<form
					class="w-full pt-4"
					method="post"
					action="?/deleteOrder"
					use:enhance={({ cancel }) => {
						if (
							!confirm(
								`Estás seguro que quieres eliminar el ${info.order?.status !== OrderStatus.QUOTE ? 'pedido' : 'presupuesto'}?`
							)
						) {
							cancel();
							return;
						}

						formLoading = true;
						return async ({ update }) => {
							await update();
							formLoading = false;
						};
					}}
				>
					<button
						class="flex w-full items-center justify-center rounded-md bg-red-700 px-4 py-2 text-white shadow hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2"
						type="submit"
					>
						<Icon class="mr-2" data={trash} />
						{info.order.status !== OrderStatus.QUOTE ? 'Eliminar pedido' : 'Eliminar presupuesto'}
					</button>
				</form>
			</div>
		{/if}
	</div>
{/await}

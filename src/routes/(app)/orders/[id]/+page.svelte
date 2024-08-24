<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Icon } from 'svelte-awesome';
	import { faCamera } from '@fortawesome/free-solid-svg-icons/faCamera';
	import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint';
	import { faClipboardList } from '@fortawesome/free-solid-svg-icons/faClipboardList';
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';
	import { faClock } from '@fortawesome/free-solid-svg-icons/faClock';
	import { faUserLarge } from '@fortawesome/free-solid-svg-icons/faUserLarge';
	import trash from 'svelte-awesome/icons/trash';

	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { OrderUtilites, isOrderTemp, orderStatusMap } from '$lib/shared/order.utilities';
	import { OrderStatus } from '$lib/type/order.type';
	import { CalculatedItemUtilities } from '$lib/shared/calculated-item.utilites';
	import OrderButtons from '$lib/components/order/OrderButtons.svelte';
	import QuoteButtons from '$lib/components/order/QuoteButtons.svelte';
	import Box from '$lib/components/Box.svelte';
	import OrderStatusInfo from '$lib/components/order/OrderStatusInfo.svelte';
	import OrderInfo from '$lib/components/order/OrderInfo.svelte';
	import OrderElements from '$lib/components/order/OrderElements.svelte';
	import { DateTime } from 'luxon';

	let formLoading = false;

	function setFormLoading(value: boolean) {
		formLoading = value;
	}

	export let data: PageData;
	const totalOrder = data.calculatedItem
		? CalculatedItemUtilities.getTotal(data.calculatedItem)
		: 0;
</script>

<div class="space flex w-full flex-col p-3">
	{#if data.order == null}
		<span class="p-5 text-2xl text-red-700">Cliente o pedido no encontrado</span>
	{:else if isOrderTemp(data.order)}
		{goto(`/orders/${data.order.id}/link`)}
	{:else}
		<Box
			title={data.order.status === OrderStatus.QUOTE
				? 'Información del Presupuesto'
				: 'Información del Pedido'}
		>
			<div class="space-y-2">
				<div class="flex items-center text-lg text-gray-700">
					<Icon class="mr-2 text-blue-600" data={faUserLarge} />
					<span>{data.order.customer.name}</span>
				</div>
				<div class="text-md flex items-center text-gray-700">
					<Icon
						class="mr-2 text-green-600"
						data={data.order.status === OrderStatus.QUOTE ? faClipboardList : faBox}
					/>
					<span>{OrderUtilites.getOrderPublicId(data.order)}</span>
				</div>
				<div class="text-md flex items-center text-gray-700">
					<Icon class="mr-2 text-gray-600" data={faClock} />
					<span>{DateTime.fromJSDate(data.order.createdAt).toFormat('dd/MM/yyyy HH:mm')}</span>
				</div>
			</div>
		</Box>

		{#if !formLoading}
			<div
				class="flex w-full flex-col place-content-center items-center justify-center gap-1 pt-4 md:grid md:grid-cols-2 lg:grid-cols-3"
			>
				<a
					class="flex w-full items-center justify-center rounded-md bg-yellow-500 px-4 py-2 text-white shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2"
					target="_blank"
					href={`/orders/${data.order.id}/print`}
				>
					<Icon class="mr-2" data={faPrint} /> Imprimir
				</a>

				{#if data.order.status === OrderStatus.QUOTE}
					<QuoteButtons order={data.order}></QuoteButtons>
				{:else}
					<OrderButtons
						order={data.order}
						calculatedItem={data.calculatedItem}
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
						goto(`/orders/${data?.order?.id}/files`);
					}}
				>
					<Icon class="mr-2" data={faCamera} /> Cámara
				</button>
			</div>

			{#if data.calculatedItem}
				<OrderStatusInfo order={data.order} {totalOrder}></OrderStatusInfo>
			{/if}

			<hr class="mb-3 mt-2 border-t border-gray-200 lg:col-span-2" />

			<OrderInfo order={data.order}></OrderInfo>

			<hr class="mb-3 mt-2 border-t border-gray-200 lg:col-span-2" />

			{#if data.calculatedItem}
				<OrderElements order={data.order} calculatedItem={data.calculatedItem}></OrderElements>
			{/if}

			<form
				class="w-full pt-4"
				method="post"
				action="?/deleteOrder"
				use:enhance={({ cancel }) => {
					if (
						!confirm(
							`Estás seguro que quieres eliminar el ${data.order?.status !== OrderStatus.QUOTE ? 'pedido' : 'presupuesto'}?`
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
					{data.order.status !== OrderStatus.QUOTE ? 'Eliminar pedido' : 'Eliminar presupuesto'}
				</button>
			</form>
		</div>
	{/if}
</div>

<script lang="ts">
	import type { PageData } from './$types';
	import { DateTime } from 'luxon';
	import { goto } from '$app/navigation';
	import { Icon } from 'svelte-awesome';
	import { faMessage } from '@fortawesome/free-solid-svg-icons/faMessage';
	import { faMoneyBill } from '@fortawesome/free-solid-svg-icons/faMoneyBill';
	import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint';
	import plus from 'svelte-awesome/icons/plus';
	import trash from 'svelte-awesome/icons/trash';

	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import OrderId from '$lib/components/OrderId.svelte';
	import { isOrderTemp } from '$lib/shared/order.utilities';
	import Spacer from '$lib/components/item/Spacer.svelte';

	let formLoading = false;

	export let data: PageData;
</script>

<div class="space flex w-full flex-col p-3">
	{#await data.order}
		<ProgressBar />
	{:then order}
		{#if order == null}
			<span class="p-5 text-2xl text-red-700">Cliente o pedido no encontrado</span>
		{:else if isOrderTemp(order)}
			{goto(`/orders/${order.id}/link`)}
		{:else}
			<span class="pb-1 text-xl text-gray-700">{order.customer.name} | <OrderId {order} /></span>
			{#if !formLoading}
				<div
					class="flex w-full flex-col place-content-center items-center justify-center gap-1 md:grid md:grid-cols-2 lg:grid-cols-3"
				>
					<button class="variant-filled-success btn btn-sm w-full" disabled={formLoading}
						><Icon class="mr-1" data={faPrint} />Imprimir pedido</button
					>
					<form
						class="w-full"
						method="post"
						action="?/deleteOrder"
					>
						<button class="variant-filled-error btn btn-sm w-full" disabled={formLoading}
							><Icon class="mr-1" data={trash} />Eliminar pedido</button
						>
					</form>
					<a
						class="variant-filled-warning btn btn-sm w-full"
						href="/customers/{order.customer.id}/orders/new"
						><Icon class="mr-1" data={plus} />Nuevo pedido para cliente</a
					>
					<button disabled={formLoading} class="variant-filled btn btn-sm w-full"
						><Icon class="mr-1" data={faMessage} /> Enviar SMS terminado
					</button>

					{#if order.amountPayed === data.calculatedItem?.total}
						<form
							class="w-full"
							method="post"
							action="?/unpayOrder"
						>
							<button class="variant-filled-secondary btn btn-sm w-full" disabled={formLoading}
								><Icon class="mr-1" data={faMoneyBill} />Marcar como no pagado</button
							>
						</form>
					{:else}
						<form
							class="w-full"
							method="post"
							action="?/payOrderFull"
						>
							<button class="variant-filled-secondary btn btn-sm w-full" disabled={formLoading}
								><Icon class="mr-1" data={faMoneyBill} />Marcar como pagado</button
							>
						</form>
						<form class="grid w-full grid-cols-2 gap-1" method="post" action="?/payOrderPartially">
							<div
								class="input-group input-group-divider grid-cols-[auto_1fr_auto]"
								style="height: 32px;"
							>
								<div class="input-group-shim">€</div>
								<input type="number" class="pt-1" name="amount" placeholder="Cantidad" />
							</div>
							<button class="variant-filled-secondary btn btn-sm"
								><Icon class="mr-1" data={faMoneyBill} />Añadir pago a cuenta</button
							>
						</form>
					{/if}
				</div>
			{/if}

			{#if formLoading}
				<ProgressBar text={'Aplicando cambios...'} />
			{/if}

			<Spacer title={'Datos del pedido'} />
			<div class="flex w-full flex-col space-y-1">
				<span class="text-md text-gray-700"
					>Unidades: <span class="variant-ghost badge">{order.item.quantity}</span></span
				>
				<span class="text-md text-gray-700">Dependiente: {order.userName}</span>
				<span class="text-md text-gray-700"
					>Fecha y hora: {DateTime.fromJSDate(order.createdAt).toFormat('dd/MM/yyyy HH:mm')}</span
				>
				<span class="text-md text-gray-700"
					>Fecha de entrega: {DateTime.fromJSDate(order.item.deliveryDate).toFormat(
						'dd/MM/yyyy'
					)}</span
				>
				<span class="text-md text-gray-700"
					>Medidas de la obra: {`${order.item.height}x${order.item.width} cm`}</span
				>
				<span class="text-md text-gray-700"
					>Medidas PP: {#if order.item.ppDimensions}
						{`Arriba: ${order.item.ppDimensions.up} cm, Abajo: ${order.item.ppDimensions.down} cm, Izquierda: ${order.item.ppDimensions.left} cm, Derecha: ${order.item.ppDimensions.right} cm`}
					{:else}
						{`${order.item.pp} cm`}
					{/if}</span
				>
				<span class="text-md text-gray-700">Descripción: {order.item.description}</span>
				<span class="text-md text-gray-700">Observaciones: {order.item.observations}</span>
				{#each order.item.predefinedObservations as obv}
					<span class="text-md text-gray-700">- {obv}</span>
				{/each}
				<Spacer title={'Elementos'} />
				{#if data.calculatedItem}
					{#each data.calculatedItem.parts as part}
						<span class="text-md text-gray-700">
							- {part.description}
							<span class="variant-ghost badge">{part.price.toFixed(2)}€</span>
							{#if part.quantity > 1}
								<span class="variant-ghost badge">x{part.quantity} </span>
							{/if}
						</span>
					{/each}

					{#if data.calculatedItem.quantity > 1}<span class="text-md text-gray-700">
							Precio unitario: <span class="variant-ghost badge"
								>{data.calculatedItem.total / data.calculatedItem.quantity}€</span
							>
						</span>
					{/if}
					{#if data.calculatedItem.discount > 0}<span class="text-md text-gray-700">
							Descuento: <span class="variant-ghost badge">{data.calculatedItem.discount}%</span>
						</span>
					{/if}
					<span class="variant-ghost badge">Total {data.calculatedItem.total.toFixed(2)}€</span>
					{#if order.amountPayed === 0}
						<span class="variant-ghost-warning badge"> No pagado </span>
					{:else if order.amountPayed === data.calculatedItem.total}
						<span class="variant-ghost-success badge"> Pagado </span>
					{:else}
						<span class="variant-ghost-secondary badge">
							{order.amountPayed.toFixed(2)}€ pagado - {(
								data.calculatedItem.total - order.amountPayed
							).toFixed(2)}€ pendiente
						</span>
					{/if}
				{/if}
			</div>
		{/if}
	{/await}
</div>

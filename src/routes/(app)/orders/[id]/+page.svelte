<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
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
	import Button from '$lib/components/button/Button.svelte';
	import {
		ACCIONES_NEUTRES_COLORS,
		ACCIONES_RESGUARDO_COLORS,
		ELIMINAR_COLORS
	} from '$lib/ui/ui.constants';
	import Divider from '$lib/components/Divider.svelte';
	import SubmitButton from '$lib/components/button/SubmitButton.svelte';
	import { faEdit } from '@fortawesome/free-solid-svg-icons/faEdit';
	import { faCopy } from '@fortawesome/free-solid-svg-icons/faCopy';

	let formLoading = false;

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
				<div class="flex w-full flex-col gap-1 pt-4 md:grid md:grid-cols-2 lg:grid-cols-3">
					<Button
						icon={faPrint}
						colorClasses={ACCIONES_RESGUARDO_COLORS}
						text="Imprimir"
						forceLink={true}
						link={`/orders/${info.order.id}/print`}
					></Button>

					{#if info.order.status === OrderStatus.QUOTE}
						<QuoteButtons order={info.order} hasFiles={info.hasFiles}></QuoteButtons>
					{:else}
						<OrderButtons hasFiles={info.hasFiles} order={info.order}></OrderButtons>
					{/if}
					<Divider hideOnDesktop={true}></Divider>
					<Button
						icon={faEdit}
						colorClasses={ACCIONES_NEUTRES_COLORS}
						text="Editar"
						link={`/orders/${info.order.id}/edit`}
					></Button>
					<Button
						icon={faCopy}
						colorClasses={ACCIONES_NEUTRES_COLORS}
						text="Copiar"
						link={`/customers/${info.order.customer.id}/orders/new?originId=${info.order.id}`}
					></Button>

					<Divider hideOnDesktop={true}></Divider>
					<Button
						icon={faCamera}
						colorClasses={ACCIONES_NEUTRES_COLORS}
						text="Cámara"
						link={`/orders/${info.order.id}/files`}
					></Button>
				</div>
			{/if}

			{#if formLoading}
				<span class="pt-4"> <ProgressBar text={'Aplicando cambios...'} /> </span>
			{/if}

			<div class="flex w-full flex-col gap-1">
				<span class="pt-4"> <OrderInfo order={info.order}></OrderInfo> </span>

				<span class="pt-4">
					<OrderElements order={info.order} calculatedItem={info.calculatedItem}></OrderElements>
				</span>

				{#if data.isPriceManager}
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
						<SubmitButton
							icon={trash}
							text={info.order.status !== OrderStatus.QUOTE
								? 'Eliminar pedido'
								: 'Eliminar presupuesto'}
							colorClasses={ELIMINAR_COLORS}
						></SubmitButton>
					</form>
				{/if}
			</div>
		{/if}
	</div>
{/await}

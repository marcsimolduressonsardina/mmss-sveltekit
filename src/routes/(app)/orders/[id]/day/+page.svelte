<script lang="ts">
	import type { PageData } from './$types';
	import OrderCard from '$lib/components/order/OrderCard.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { OrderUtilites } from '$lib/shared/order.utilities';
	import Box from '$lib/components/Box.svelte';
	import WhatsAppButton from '$lib/components/button/WhatsAppButton.svelte';
	import Banner from '$lib/components/Banner.svelte';
	import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';
	import { getStatusUIInfo } from '$lib/ui/ui.helper';
	import { OrderStatus } from '@marcsimolduressonsardina/core';

	export let data: PageData;
	let whatsAppNotified = false;

	function handleAfterNotify() {
		whatsAppNotified = true;
	}
</script>

<div class="space flex w-full flex-col gap-2 p-3">
	{#await data.orders}
		<ProgressBar />
	{:then fullOrders}
		<Box title={`Pedidos del mismo día | ${fullOrders[0].order.customer.name}`}>
			<div class="flex w-full flex-col place-content-center items-center justify-center gap-2">
				<WhatsAppButton
					label="Enviar mensaje todos finalizados"
					message={OrderUtilites.getWhatsappFinishedText(
						fullOrders
							.map((fullOrder) => fullOrder.order)
							.filter((order) => order.status === OrderStatus.FINISHED)
					)}
					customer={fullOrders[0].order.customer}
					tooltipText="Hay pedidos pendientes"
					notifyOrder={true}
					{handleAfterNotify}
					orders={fullOrders
						.map((fullOrder) => fullOrder.order)
						.filter((order) => order.status === OrderStatus.FINISHED)}
					disabled={fullOrders.filter(
						(fullOrder) =>
							fullOrder.order.status === OrderStatus.FINISHED ||
							fullOrder.order.status === OrderStatus.PICKED_UP
					).length !== fullOrders.length}
				></WhatsAppButton>
			</div>
		</Box>

		{#if whatsAppNotified}
			<Banner
				icon={faCheckCircle}
				gradientClasses={getStatusUIInfo(OrderStatus.PICKED_UP).gradientClasses}
				title="Cliente avisado"
				text="El mensaje de finalizado se ha enviado para todos los pedidos"
			></Banner>
		{/if}

		<div class="flex w-full flex-col gap-3 lg:grid lg:grid-cols-4">
			{#each fullOrders as fullOrder (fullOrder.order.id)}
				<OrderCard {fullOrder} showCustomer={false} />
			{/each}
		</div>
	{/await}
</div>

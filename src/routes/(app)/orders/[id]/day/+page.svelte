<script lang="ts">
	import type { PageData } from './$types';
	import OrderCard from '$lib/components/order/OrderCard.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { OrderUtilites } from '$lib/shared/order.utilities';
	import { OrderStatus } from '$lib/type/order.type';
	import Box from '$lib/components/Box.svelte';
	import WhatsAppButton from '$lib/components/button/WhatsAppButton.svelte';

	export let data: PageData;
</script>

<div class="space flex w-full flex-col gap-2 p-3">
	{#await data.orders}
		<ProgressBar />
	{:then fullOrders}
		<Box title={`Pedidos del mismo día | ${fullOrders[0].order.customer.name}`}>
			<div class="flex w-full flex-col place-content-center items-center justify-center gap-2">
				<WhatsAppButton
					label="Enviar mensaje finalizado (Sólo acabados)"
					message={OrderUtilites.getWhatsappFinishedText(
						fullOrders
							.filter((fullOrder) => fullOrder.order.status === OrderStatus.FINISHED)
							.map((fullOrder) => fullOrder.order)
					)}
					customer={fullOrders[0].order.customer}
					disabled={fullOrders.filter(
						(fullOrder) => fullOrder.order.status === OrderStatus.FINISHED
					).length === 0}
				></WhatsAppButton>
			</div>
		</Box>

		<div class="flex w-full flex-col gap-3 lg:grid lg:grid-cols-4">
			{#each fullOrders as fullOrder (fullOrder.order.id)}
				<OrderCard {fullOrder} showCustomer={false} />
			{/each}
		</div>
	{/await}
</div>

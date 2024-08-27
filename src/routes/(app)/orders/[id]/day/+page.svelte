<script lang="ts">
	import type { PageData } from './$types';
	import { faWhatsapp } from '@fortawesome/free-brands-svg-icons/faWhatsapp';
	import OrderCard from '$lib/components/order/OrderCard.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { Icon } from 'svelte-awesome';
	import { CustomerUtilites } from '$lib/shared/customer.utilities';
	import { OrderUtilites } from '$lib/shared/order.utilities';
	import { OrderStatus } from '$lib/type/order.type';
	import Box from '$lib/components/Box.svelte';
	import WhatsAppButton from '$lib/components/button/WhatsAppButton.svelte';

	export let data: PageData;
</script>

<div class="space flex w-full flex-col gap-2 p-3">
	{#await data.orders}
		<ProgressBar />
	{:then orders}
		<Box title={`Pedidos del mismo día | ${orders[0].customer.name}`}>
			<div class="flex w-full flex-col place-content-center items-center justify-center gap-2">
				<WhatsAppButton
					label="Enviar mensaje finalizado (Sólo acabados)"
					message={OrderUtilites.getWhatsappFinishedText(
						orders.filter((order) => order.status === OrderStatus.FINISHED)
					)}
					customer={orders[0].customer}
					disabled={orders.filter((order) => order.status === OrderStatus.FINISHED).length === 0}
				></WhatsAppButton>
			</div>
		</Box>

		<div class="flex w-full flex-col gap-3 lg:grid lg:grid-cols-4">
			{#each orders as order (order.id)}
				<OrderCard {order} showCustomer={false} />
			{/each}
		</div>
	{/await}
</div>

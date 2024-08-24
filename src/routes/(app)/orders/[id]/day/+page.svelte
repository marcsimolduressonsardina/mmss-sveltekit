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

	export let data: PageData;
</script>

<div class="space flex w-full flex-col gap-2 p-3">
	{#await data.orders}
		<ProgressBar />
	{:then orders}
		<Box title={`Pedidos del mismo día | ${orders[0].customer.name}`}>
			<div class="flex w-full flex-col place-content-center items-center justify-center gap-2">
				{#if orders.filter((order) => order.status === OrderStatus.FINISHED).length > 0}
					<a
						class="flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-white shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
						target="_blank"
						aria-disabled="true"
						href={CustomerUtilites.getWhatsappLink(
							orders[0].customer,
							OrderUtilites.getWhatsappFinishedText(
								orders.filter((order) => order.status === OrderStatus.FINISHED)
							)
						)}
					>
						<Icon class="mr-2" data={faWhatsapp} /> Enviar mensaje finalizado (Sólo acabados)
					</a>
				{:else}
					<button
						class="flex w-full cursor-not-allowed items-center justify-center rounded-md bg-gray-300 px-4 py-2 text-gray-600 shadow focus:outline-none"
						disabled
					>
						<Icon class="mr-2" data={faWhatsapp} /> Enviar mensaje finalizado (Sólo acabados)
					</button>
				{/if}
			</div>
		</Box>

		<div class="flex w-full flex-col gap-3 lg:grid lg:grid-cols-4">
			{#each orders as order (order.id)}
				<OrderCard {order} showCustomer={false} />
			{/each}
		</div>
	{/await}
</div>

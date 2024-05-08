<script lang="ts">
	import type { PageData } from './$types';
	import { faWhatsapp } from '@fortawesome/free-brands-svg-icons/faWhatsapp';
	import OrderCard from '$lib/components/OrderCard.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { Icon } from 'svelte-awesome';
	import { CustomerUtilites } from '$lib/shared/customer.utilities';
	import { OrderUtilites } from '$lib/shared/order.utilities';
	import { OrderStatus } from '$lib/type/order.type';

	export let data: PageData;
</script>

<div class="space flex w-full flex-col gap-1 p-3">
	{#await data.orders}
		<ProgressBar />
	{:then orders}
		<span class="pb-1 text-xl text-gray-700">Pedidos del mismo día</span>

		<div class="flex w-full flex-col place-content-center items-center justify-center gap-1">
			{#if orders.filter((order) => order.status === OrderStatus.FINISHED).length > 0}
				<a
					class="variant-filled-success btn btn-sm w-full"
					target="_blank"
					aria-disabled="true"
					href={CustomerUtilites.getWhatsappLink(
						orders[0].customer,
						OrderUtilites.getWhatsappFinishedText(
							orders.filter((order) => order.status === OrderStatus.FINISHED)
						)
					)}
				>
					<Icon class="mr-1" data={faWhatsapp} /> Enviar mensaje finalizado (Sólo acabados)
				</a>
			{:else}
				<button class="variant-ghost-success btn btn-sm w-full" disabled>
					<Icon class="mr-1" data={faWhatsapp} /> Enviar mensaje finalizado (Sólo acabados)
				</button>
			{/if}
		</div>

		<div class="flex w-full flex-col gap-1">
			{#each orders as order (order.id)}
				<OrderCard {order} />
			{/each}
		</div>
	{/await}
</div>

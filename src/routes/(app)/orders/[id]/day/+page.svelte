<script lang="ts">
	import type { PageData } from './$types';
	import { faMessage } from '@fortawesome/free-solid-svg-icons/faMessage';
	import OrderCard from '$lib/components/OrderCard.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { Icon } from 'svelte-awesome';

	export let data: PageData;
</script>

<div class="space flex w-full flex-col gap-1 p-3">
	<span class="pb-1 text-xl text-gray-700">Pedidos del mismo día</span>

	<div
		class="flex w-full flex-col place-content-center items-center justify-center gap-1 md:grid md:grid-cols-2 lg:grid-cols-3"
	>
		<button class="variant-filled btn btn-sm w-full"
			><Icon class="mr-1" data={faMessage} /> Enviar SMS
		</button>
	</div>

	<div class="flex w-full flex-col gap-1">
		{#await data.orders}
			<ProgressBar />
		{:then orders}
			{#each orders as order (order.id)}
				<OrderCard {order} />
			{/each}
		{/await}
	</div>
</div>

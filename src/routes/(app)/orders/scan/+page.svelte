<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import search from 'svelte-awesome/icons/search';
	import { goto } from '$app/navigation';
	import OrderScanner from '$lib/components/order/OrderScanner.svelte';
	import Box from '$lib/components/Box.svelte';
</script>

<Box title="Escanear pedido">
	<div class="flex flex-col items-center gap-5">
		<OrderScanner />

		<button
			class="w-full rounded-md bg-yellow-500 px-4 py-2 font-semibold text-white shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
			on:click={() => {
				goto('/orders/search');
			}}
		>
			<Icon class="mr-2" data={search} /> Introducir manualmente
		</button>
	</div>
</Box>

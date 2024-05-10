<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import search from 'svelte-awesome/icons/search';
	import { goto } from '$app/navigation';
	import OrderScanner from '$lib/components/order/OrderScanner.svelte';
</script>

<div class="px-2 pt-1 text-xl font-semibold">Escanear pedido</div>
<div class="flex w-full flex-col place-content-center items-center gap-5">
	<OrderScanner></OrderScanner>
	<button
		class="variant-filled-warning btn w-full"
		on:click={() => {
			goto('/orders/search');
		}}
	>
		<Icon class="mr-2" data={search} /> Introducir manualmente
	</button>
</div>

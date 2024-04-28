<script lang="ts">
	import { BarcodeScanner } from 'svelte-barcode-scanner';
	import { Icon } from 'svelte-awesome';
	import search from 'svelte-awesome/icons/search';
	import { goto } from '$app/navigation';
</script>

<div class="px-2 pt-1 text-xl font-semibold">Escanear pedido</div>
<div class="flex w-full flex-col place-content-center items-center gap-5">
	<div class="barcode-scanner">
		<BarcodeScanner on:detect={(event) => alert(JSON.stringify(event))} />
	</div>
	<button
		class="variant-filled-warning btn w-full"
		on:click={() => {
			goto('/orders/search');
		}}
	>
		<Icon class="mr-2" data={search} /> Introducir manualmente
	</button>
</div>

<style>
	.barcode-scanner {
		width: 100%;
		max-width: 384px;
		aspect-ratio: 1;
	}
</style>

<script lang="ts">
	import { ScanQRCode } from '@kuiper/svelte-scan-qrcode';
	import { Icon } from 'svelte-awesome';
	import search from 'svelte-awesome/icons/search';
	import { goto } from '$app/navigation';
	import ProgressBar from '$lib/components/ProgressBar.svelte';

	let result = '';
	let loading = false;

	function _onPermissionError() {
		alert('Permiso de cámara necesario');
		location.reload();
	}

	function _onResulted() {
		if (result.length > 0) {
			loading = true;
			goto('/orders/' + result);
		}
	}
</script>

<div class="px-2 pt-1 text-xl font-semibold">Escanear pedido</div>
<div class="flex w-full flex-col place-content-center items-center gap-5">
	{#if loading}
		<ProgressBar text={'Cargando pedido...'} />
	{:else}
		<ScanQRCode
			bind:scanResult={result}
			enableQRCodeReaderButton={false}
			options={{
				onPermissionError: () => _onPermissionError(),
				onResulted: () => _onResulted()
			}}
		/>
		<button
			class="variant-filled-warning btn w-full"
			on:click={() => {
				goto('/orders/search');
			}}
		>
			<Icon class="mr-2" data={search} /> Introducir manualmente
		</button>
	{/if}
</div>

<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import search from 'svelte-awesome/icons/search';
	import { goto } from '$app/navigation';
	import OrderScanner from '$lib/components/order/OrderScanner.svelte';
	import Box from '$lib/components/Box.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import { ACCIONES_NEUTRES_COLORS } from '$lib/ui/ui.constants';
</script>

<Box title="Escanear pedido">
	<div class="flex flex-col items-center gap-5">
		<OrderScanner />
		<Button
			text="Introducir No. Pedido"
			icon={search}
			link="/orders/search"
			colorClasses={ACCIONES_NEUTRES_COLORS}
		></Button>
	</div>
</Box>

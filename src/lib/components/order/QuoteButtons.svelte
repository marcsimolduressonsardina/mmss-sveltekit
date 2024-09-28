<script lang="ts">
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';
	import type { Order } from '$lib/type/api.type';
	import Button from '$lib/components/button/Button.svelte';
	import { PEDIDOS_COLORS } from '$lib/ui/ui.constants';

	export let order: Order;
</script>

<Button
	textWhite={false}
	icon={faBox}
	colorClasses={PEDIDOS_COLORS}
	text="Convertir en pedido"
	link={`/orders/${order.id}/promote`}
></Button>

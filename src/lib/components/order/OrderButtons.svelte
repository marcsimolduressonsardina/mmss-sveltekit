<script lang="ts">
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';

	import { OrderStatus } from '$lib/type/order.type';
	import type { Order } from '$lib/type/api.type';
	import Button from '$lib/components/button/Button.svelte';
	import { PEDIDOS_COLORS } from '$lib/ui/ui.constants';
	import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
	import { getStatusUIInfo } from '$lib/ui/ui.helper';

	export let order: Order;
</script>

<!-- View Customer and Day Orders Buttons -->

<Button
	textWhite={false}
	icon={faBox}
	colorClasses={PEDIDOS_COLORS}
	text="Pedidos del día"
	link={`/orders/${order.id}/day`}
></Button>

<Button
	icon={faClipboardList}
	colorClasses={getStatusUIInfo(OrderStatus.QUOTE).colors}
	text="Convertir en presupuesto"
	link={`/orders/${order.id}/denote`}
></Button>

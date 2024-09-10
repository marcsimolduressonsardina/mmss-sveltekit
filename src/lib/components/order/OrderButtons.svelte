<script lang="ts">
	import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';

	import { OrderUtilites } from '$lib/shared/order.utilities';
	import { OrderStatus } from '$lib/type/order.type';
	import { CalculatedItemUtilities } from '$lib/shared/calculated-item.utilites';
	import type { CalculatedItem, Order } from '$lib/type/api.type';
	import Divider from '$lib/components/Divider.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import WhatsAppButton from '$lib/components/button/WhatsAppButton.svelte';
	import { ACCIONES_VER_COLORS, PEDIDOS_COLORS } from '$lib/ui/ui.constants';

	export let hasFiles: boolean;
	export let order: Order;
	export let calculatedItem: CalculatedItem | null;

	const totalOrder = calculatedItem ? CalculatedItemUtilities.getTotal(calculatedItem) : 0;
</script>

<!-- View Customer and Day Orders Buttons -->
<Button
	icon={faUser}
	colorClasses={ACCIONES_VER_COLORS}
	text="Ver cliente"
	link="/customers/{order.customer.id}"
></Button>

<Button
	textWhite={false}
	icon={faBox}
	colorClasses={PEDIDOS_COLORS}
	text="Pedidos del día"
	link={`/orders/${order.id}/day`}
></Button>

{#if hasFiles}
	<Divider></Divider>
	<!-- Whatsapp Button -->
	<WhatsAppButton
		label="Enviar resguardo a cliente"
		message={OrderUtilites.getWhatsappTicketText(order)}
		customer={order.customer}
	></WhatsAppButton>

	{#if order.status === OrderStatus.FINISHED}
		<WhatsAppButton
			label="Enviar mensaje finalizado"
			message={OrderUtilites.getWhatsappFinishedText([order])}
			customer={order.customer}
		></WhatsAppButton>
	{/if}
{/if}

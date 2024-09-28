<script lang="ts">
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';

	import { OrderUtilites } from '$lib/shared/order.utilities';
	import { OrderStatus } from '$lib/type/order.type';
	import type { Order } from '$lib/type/api.type';
	import Divider from '$lib/components/Divider.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import WhatsAppButton from '$lib/components/button/WhatsAppButton.svelte';
	import { PEDIDOS_COLORS } from '$lib/ui/ui.constants';
	import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
	import { getStatusUIInfo } from '$lib/ui/ui.helper';

	export let hasFiles: boolean;
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
			label="Enviar mensaje finalizado {order.notified ? '(YA AVISADO)' : ''}"
			message={OrderUtilites.getWhatsappFinishedText([order])}
			customer={order.customer}
			notifyOrder={true}
			{order}
		></WhatsAppButton>
	{/if}
{/if}

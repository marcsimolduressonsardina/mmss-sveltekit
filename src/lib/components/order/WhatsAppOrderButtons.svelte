<script lang="ts">
	import { OrderUtilites } from '$lib/shared/order.utilities';
	import type { Order } from '$lib/type/api.type';
	import { OrderStatus } from '$lib/type/order.type';
	import { faWhatsapp } from '@fortawesome/free-brands-svg-icons/faWhatsapp';
	import Button from '../button/Button.svelte';
	import WhatsAppButton from '../button/WhatsAppButton.svelte';
	import Divider from '../Divider.svelte';
	import { WHATSAPP_COLORS } from '$lib/ui/ui.constants';
	import type { ISameDayOrderCounters } from '$lib/server/service/order.service';
	import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';
	import { getStatusUIInfo } from '$lib/ui/ui.helper';
	import Banner from '../Banner.svelte';

	export let order: Order;
	export let counters: ISameDayOrderCounters;
	export let hasFiles: Boolean;
	let whatsAppNotified = false;

	function handleAfterNotify() {
		whatsAppNotified = true;
	}
</script>

<Divider></Divider>
{#if order.status === OrderStatus.QUOTE}
	<WhatsAppButton
		label="Enviar presupuesto"
		message={OrderUtilites.getWhatsappQuoteText(order)}
		customer={order.customer}
		tooltipText="Faltan fotos"
		disabled={!hasFiles}
	></WhatsAppButton>
{:else}
	<WhatsAppButton
		label="Enviar resguardo"
		message={OrderUtilites.getWhatsappTicketText(order)}
		customer={order.customer}
		tooltipText="Faltan fotos"
		disabled={!hasFiles}
	></WhatsAppButton>
{/if}
{#if order.status === OrderStatus.FINISHED}
	{#if order.notified || whatsAppNotified}
		<Banner
			small={true}
			icon={faCheckCircle}
			gradientClasses={getStatusUIInfo(OrderStatus.PICKED_UP).gradientClasses}
			title="Cliente avisado"
			text="El mensaje de finalizado ya ha sido enviado para este pedido."
		></Banner>
	{/if}
	{#if counters.totalCount === 1}
		<WhatsAppButton
			label="Enviar mensaje finalizado"
			message={OrderUtilites.getWhatsappFinishedText([order])}
			customer={order.customer}
			notifyOrder={true}
			{handleAfterNotify}
			orders={[order]}
			tooltipText="Faltan fotos"
			disabled={!hasFiles}
		></WhatsAppButton>
	{:else}
		<Button
			icon={faWhatsapp}
			text={'Enviar mensaje finalizado'}
			tooltipText={'Faltan fotos'}
			link={`/orders/${order.id}/whatsapp`}
			colorClasses={WHATSAPP_COLORS}
			disabled={!hasFiles}
		></Button>
	{/if}
{/if}

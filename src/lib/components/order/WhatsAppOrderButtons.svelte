<script lang="ts">
	import { OrderUtilites } from '$lib/shared/order.utilities';
	import { faWhatsapp } from '@fortawesome/free-brands-svg-icons/faWhatsapp';
	import Button from '../button/Button.svelte';
	import WhatsAppButton from '../button/WhatsAppButton.svelte';
	import Divider from '../Divider.svelte';
	import { WHATSAPP_COLORS } from '$lib/ui/ui.constants';
	import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';
	import { getStatusUIInfo } from '$lib/ui/ui.helper';
	import { Icon } from 'svelte-awesome';
	import {
		OrderStatus,
		type ISameDayOrderCounters,
		type Order
	} from '@marcsimolduressonsardina/core';

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
		<div
			class={`rounded-lg bg-gradient-to-r p-1 text-white shadow-md ${getStatusUIInfo(OrderStatus.PICKED_UP).gradientClasses}`}
		>
			<div
				class="flex flex-row items-center justify-center space-x-3 rounded-md bg-white p-2 shadow-inner md:p-1"
			>
				<div class="flex animate-pulse items-center rounded-full bg-green-100 p-1">
					<Icon scale={1} data={faCheckCircle} class="text-green-500" />
				</div>
				<h3 class="text-md font-semibold text-green-600">Cliente avisado</h3>
			</div>
		</div>
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

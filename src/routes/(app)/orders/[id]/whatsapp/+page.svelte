<script lang="ts">
	import Box from '$lib/components/Box.svelte';

	import { OrderUtilites } from '$lib/shared/order.utilities';
	import type { PageData } from './$types';

	import { OrderStatus } from '$lib/type/order.type';
	import WhatsAppButton from '$lib/components/button/WhatsAppButton.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';
	import { PEDIDOS_COLORS } from '$lib/ui/ui.constants';
	import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
	import { getStatusUIInfo } from '$lib/ui/ui.helper';
	import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';
	import Banner from '$lib/components/Banner.svelte';

	export let data: PageData;
	let whatsAppNotified = false;

	function handleAfterNotify() {
		whatsAppNotified = true;
	}
</script>

<Box>
	<div class="flex flex-col gap-2">
		{#if data.order}
			{#if data.order.status === OrderStatus.FINISHED}
				{#if data.orderCounters.totalCount > 1}
					{#if data.orderCounters.pendingCount > 0}
						<Banner
							icon={faExclamationTriangle}
							gradientClasses={getStatusUIInfo(OrderStatus.PENDING).gradientClasses}
							title="Hay pedidos pendientes"
							text="Tienes pedidos pendientes del mismo día. Puedes enviar el mensaje de finalizado
										de este pedido o revisar los otros pedidos del día."
						></Banner>
					{:else}
						<Banner
							icon={faExclamationTriangle}
							gradientClasses={getStatusUIInfo(OrderStatus.FINISHED).gradientClasses}
							title="Todos los pedidos del día están finalizados"
							text=""
						></Banner>
					{/if}

					{#if data.order.notified || whatsAppNotified}
						<Banner
							icon={faCheckCircle}
							gradientClasses={getStatusUIInfo(OrderStatus.PICKED_UP).gradientClasses}
							title="Cliente avisado"
							text=""
						></Banner>
					{/if}

					<div class="flex flex-col gap-2 lg:flex-row">
						<Button
							textWhite={false}
							icon={faBox}
							colorClasses={PEDIDOS_COLORS}
							text="Ver pedidos del día"
							link={`/orders/${data.order.id}/day`}
						></Button>

						<WhatsAppButton
							label="Enviar mensaje finalizado"
							message={OrderUtilites.getWhatsappFinishedText([data.order])}
							customer={data.order.customer}
							{handleAfterNotify}
							notifyOrder={true}
							orders={[data.order]}
						></WhatsAppButton>
					</div>
				{/if}
			{/if}
		{/if}
	</div>
</Box>

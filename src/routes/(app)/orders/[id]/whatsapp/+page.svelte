<script lang="ts">
	import Box from '$lib/components/Box.svelte';

	import { OrderUtilites } from '$lib/shared/order.utilities';
	import type { PageData } from './$types';

	import { OrderStatus } from '$lib/type/order.type';
	import WhatsAppButton from '$lib/components/button/WhatsAppButton.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';
	import { PEDIDOS_COLORS } from '$lib/ui/ui.constants';
	import Divider from '$lib/components/Divider.svelte';
	import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
	import { Icon } from 'svelte-awesome';
	import { getStatusUIInfo } from '$lib/ui/ui.helper';

	export let data: PageData;
</script>

<Box title="Enviar mensajes">
	<div class="flex flex-col gap-2">
		{#if data.order}
			{#if data.order.status === OrderStatus.QUOTE}
				<WhatsAppButton
					label="Enviar presupuesto"
					message={OrderUtilites.getWhatsappQuoteText(data.order)}
					customer={data.order.customer}
				></WhatsAppButton>
			{:else}
				<WhatsAppButton
					label="Enviar resguardo"
					message={OrderUtilites.getWhatsappTicketText(data.order)}
					customer={data.order.customer}
				></WhatsAppButton>

				{#if data.order.status === OrderStatus.FINISHED}
					<Divider hideOnDesktop={false}></Divider>
					{#if data.orderCounters.totalCount === 1}
						<WhatsAppButton
							label="Enviar mensaje finalizado {data.order.notified ? '(YA AVISADO)' : ''}"
							message={OrderUtilites.getWhatsappFinishedText([data.order])}
							customer={data.order.customer}
							notifyOrder={true}
							orders={[data.order]}
						></WhatsAppButton>
					{:else}
						{#if data.orderCounters.unfinishedCount > 0}
							<div
								class={`rounded-lg bg-gradient-to-r p-6 text-white shadow-md ${getStatusUIInfo(OrderStatus.PENDING).gradientClasses}`}
							>
								<div class="flex items-center space-x-4">
									<Icon scale={3} data={faExclamationTriangle} />
									<div>
										<h3 class="text-xl font-bold">Hay pedidos pendientes</h3>
										<p class="text-sm">
											Tienes pedidos pendientes del mismo día. Puedes enviar el mensaje de
											finalizado de este pedido o revisar los otros pedidos del día.
										</p>
									</div>
								</div>
							</div>
						{:else}
							<div
								class={`rounded-lg bg-gradient-to-r p-6 text-white shadow-md ${getStatusUIInfo(OrderStatus.FINISHED).gradientClasses}`}
							>
								<div class="flex items-center space-x-4">
									<Icon scale={3} data={faExclamationTriangle} />
									<div>
										<h3 class="text-xl font-bold">Hay pedidos finalizados</h3>
										<p class="text-sm">
											Todos los pedidos creados el mismo día están finalizados, accede a los pedidos
											del día para enviar el mensaje.
										</p>
									</div>
								</div>
							</div>
						{/if}

						<div class="flex flex-col gap-2 lg:flex-row">
							<Button
								textWhite={false}
								icon={faBox}
								colorClasses={PEDIDOS_COLORS}
								text="Ver pedidos del día"
								link={`/orders/${data.order.id}/day`}
							></Button>

							{#if data.orderCounters.unfinishedCount > 0}
								{#if data.order.notified}
									Ya avisado
								{/if}

								<WhatsAppButton
									label="Enviar mensaje finalizado"
									message={OrderUtilites.getWhatsappFinishedText([data.order])}
									customer={data.order.customer}
									notifyOrder={true}
									orders={[data.order]}
								></WhatsAppButton>
							{:else}{/if}
						</div>
					{/if}
				{/if}
			{/if}
		{/if}
	</div>
</Box>

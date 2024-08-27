<script lang="ts">
	import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';
	import { OrderUtilites } from '$lib/shared/order.utilities';
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';
	import type { Order } from '$lib/type/api.type';
	import WhatsAppButton from '$lib/components/button/WhatsAppButton.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import { ACCIONES_VER_COLORS, PEDIDOS_COLORS } from '$lib/ui/ui.constants';

	export let order: Order;
</script>

<WhatsAppButton
	label="Enviar presupuesto a cliente"
	message={OrderUtilites.getWhatsappQuoteText(order)}
	customer={order.customer}
></WhatsAppButton>

<Button
	icon={faUser}
	colorClasses={ACCIONES_VER_COLORS}
	text="Ver cliente"
	link="/customers/{order.customer.id}"
></Button>

<Button
	icon={faBox}
	colorClasses={PEDIDOS_COLORS}
	text="Convertir en pedido"
	link={`/orders/${order.id}/promote`}
></Button>

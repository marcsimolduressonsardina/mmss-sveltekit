<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Icon } from 'svelte-awesome';
	import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
	import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';
	import { faWhatsapp } from '@fortawesome/free-brands-svg-icons/faWhatsapp';
	import { faMoneyBill } from '@fortawesome/free-solid-svg-icons/faMoneyBill';
	import { faTruckPickup } from '@fortawesome/free-solid-svg-icons/faTruckPickup';
	import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons/faClockRotateLeft';
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';

	import { OrderUtilites } from '$lib/shared/order.utilities';
	import { OrderStatus } from '$lib/type/order.type';
	import { CalculatedItemUtilities } from '$lib/shared/calculated-item.utilites';
	import type { CalculatedItem, Order } from '$lib/type/api.type';
	import SubmitButton from '$lib/components/button/SubmitButton.svelte';
	import Divider from '$lib/components/Divider.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import WhatsAppButton from '$lib/components/button/WhatsAppButton.svelte';
	import {
		ACCIONES_VER_COLORS,
		LISTADO_FINALIZADOS,
		MARCAR_NO_PAGADA_COLORS,
		MARCAR_PAGADA_COLORS,
		MARCAR_PENDIENTE_COLORS,
		MARCAR_RECOGIDO_COLORS,
		PEDIDOS_COLORS
	} from '$lib/ui/ui.constants';

	export let setFormLoading: (value: boolean) => void;
	export let hasFiles: boolean;
	export let order: Order;
	export let calculatedItem: CalculatedItem | null;

	const totalOrder = calculatedItem ? CalculatedItemUtilities.getTotal(calculatedItem) : 0;
</script>

<!-- Payment Buttons -->
{#if order.amountPayed === totalOrder}
	<form
		class="w-full"
		method="post"
		action="?/unpayOrder"
		use:enhance={() => {
			setFormLoading(true);
			return async ({ update }) => {
				await update();
				setFormLoading(false);
			};
		}}
	>
		<SubmitButton
			icon={faMoneyBill}
			text="Marcar como no pagado"
			colorClasses={MARCAR_NO_PAGADA_COLORS}
		></SubmitButton>
	</form>
{:else}
	<form
		class="w-full"
		method="post"
		action="?/payOrderFull"
		use:enhance={() => {
			setFormLoading(true);
			return async ({ update }) => {
				await update();
				setFormLoading(false);
			};
		}}
	>
		<SubmitButton icon={faMoneyBill} text="Marcar como pagado" colorClasses={MARCAR_PAGADA_COLORS}
		></SubmitButton>
	</form>
	<form
		class="grid w-full grid-cols-2 gap-2"
		method="post"
		action="?/payOrderPartially"
		use:enhance={() => {
			setFormLoading(true);
			return async ({ update }) => {
				await update();
				setFormLoading(false);
			};
		}}
	>
		<SubmitButton icon={faMoneyBill} text="Pago a cuenta" colorClasses={MARCAR_PAGADA_COLORS}
		></SubmitButton>
		<div class="flex items-center space-x-2">
			<div class="rounded-md bg-gray-200 px-3 py-2 text-gray-700">€</div>
			<input
				type="number"
				class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
				name="amount"
				placeholder="Cantidad"
				step="0.01"
			/>
		</div>
	</form>
{/if}

<!-- Order Status Buttons -->
{#if order.status !== OrderStatus.FINISHED}
	<form
		class="w-full"
		method="post"
		action="?/setOrderFinished"
		use:enhance={() => {
			setFormLoading(true);
			return async ({ update }) => {
				await update();
				setFormLoading(false);
			};
		}}
	>
		<SubmitButton icon={faCheck} text="Marcar como finalizado" colorClasses={LISTADO_FINALIZADOS}
		></SubmitButton>
	</form>
{/if}

{#if order.status !== OrderStatus.PENDING}
	<form
		class="w-full"
		method="post"
		action="?/setOrderPending"
		use:enhance={() => {
			setFormLoading(true);
			return async ({ update }) => {
				await update();
				setFormLoading(false);
			};
		}}
	>
		<SubmitButton
			icon={faClockRotateLeft}
			text="Marcar como pendiente"
			colorClasses={MARCAR_PENDIENTE_COLORS}
		></SubmitButton>
	</form>
{/if}

{#if order.status !== OrderStatus.PICKED_UP}
	<form
		class="w-full"
		method="post"
		action="?/setOrderPickedUp"
		use:enhance={() => {
			setFormLoading(true);
			return async ({ update }) => {
				await update();
				setFormLoading(false);
			};
		}}
	>
		<SubmitButton
			icon={faTruckPickup}
			text="Marcar como recogido"
			colorClasses={MARCAR_RECOGIDO_COLORS}
		></SubmitButton>
	</form>
{/if}

<Divider></Divider>

{#if hasFiles}
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

	<Divider></Divider>
{/if}

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

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
	import { CustomerUtilites } from '$lib/shared/customer.utilities';
	import type { CalculatedItem, Order } from '$lib/type/api.type';

	export let formLoading: boolean;
	export let setFormLoading: (value: boolean) => void;
	export let order: Order;
	export let calculatedItem: CalculatedItem | null;

	const totalOrder = calculatedItem ? CalculatedItemUtilities.getTotal(calculatedItem) : 0;
</script>

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
		<button class="variant-filled-secondary btn btn-sm w-full" disabled={formLoading}
			><Icon class="mr-1" data={faMoneyBill} />Marcar como no pagado</button
		>
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
		<button class="variant-filled-secondary btn btn-sm w-full"
			><Icon class="mr-1" data={faMoneyBill} />Marcar como pagado</button
		>
	</form>
	<form
		class="grid w-full grid-cols-2 gap-1"
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
		<button class="variant-filled-secondary btn btn-sm"
			><Icon class="mr-1" data={faMoneyBill} />Añadir pago a cuenta</button
		>
		<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]" style="height: 32px;">
			<div class="input-group-shim">€</div>
			<input type="number" class="pt-1" name="amount" placeholder="Cantidad" step="0.01" />
		</div>
	</form>
{/if}
<a
	class="variant-filled-success btn btn-sm w-full"
	target="_blank"
	href={CustomerUtilites.getWhatsappLink(
		order.customer,
		OrderUtilites.getWhatsappTicketText(order)
	)}
	><Icon class="mr-1" data={faWhatsapp} /> Enviar resguardo a cliente
</a>

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
		<button class="variant-ghost-primary btn btn-sm w-full"
			><Icon class="mr-1" data={faCheck} />Marcar como finalizado</button
		>
	</form>
{/if}

{#if order.status === OrderStatus.FINISHED}
	<a
		class="variant-filled-success btn btn-sm w-full"
		target="_blank"
		aria-disabled="true"
		href={CustomerUtilites.getWhatsappLink(
			order.customer,
			OrderUtilites.getWhatsappFinishedText([order])
		)}
	>
		<Icon class="mr-1" data={faWhatsapp} /> Enviar mensaje finalizado
	</a>
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
		<button class="variant-ghost btn btn-sm w-full"
			><Icon class="mr-1" data={faClockRotateLeft} />Marcar como pendiente</button
		>
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
		<button class="variant-ghost-tertiary btn btn-sm w-full"
			><Icon class="mr-1" data={faTruckPickup} />Marcar como recogido</button
		>
	</form>
{/if}
<a class="variant-filled-warning btn btn-sm w-full" href="/customers/{order.customer.id}"
	><Icon class="mr-1" data={faUser} />Ver cliente</a
>
<button
	class="variant-filled btn btn-sm w-full"
	on:click={() => {
		goto(`/orders/${order.id}/day`);
	}}
	><Icon class="mr-1" data={faBox} /> Pedidos del día
</button>

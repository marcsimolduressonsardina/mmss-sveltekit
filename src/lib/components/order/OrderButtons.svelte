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
		<button
			class="flex w-full items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-white shadow hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:ring-offset-2"
			disabled={formLoading}
		>
			<Icon class="mr-2" data={faMoneyBill} /> Marcar como no pagado
		</button>
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
		<button
			class="flex w-full items-center justify-center rounded-md bg-teal-600 px-4 py-2 text-white shadow hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
		>
			<Icon class="mr-2" data={faMoneyBill} /> Marcar como pagado
		</button>
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
		<button
			class="flex w-full items-center justify-center rounded-md bg-yellow-600 px-4 py-2 text-white shadow hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:ring-offset-2"
		>
			<Icon class="mr-2" data={faMoneyBill} /> Pago a cuenta
		</button>
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

<!-- Whatsapp Button -->
<a
	class="flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-white shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
	target="_blank"
	href={CustomerUtilites.getWhatsappLink(
		order.customer,
		OrderUtilites.getWhatsappTicketText(order)
	)}
>
	<Icon class="mr-2" data={faWhatsapp} /> Enviar resguardo a cliente
</a>

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
		<button
			class="flex w-full items-center justify-center rounded-md bg-lime-600 px-4 py-2 text-white shadow hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-700 focus:ring-offset-2"
		>
			<Icon class="mr-2" data={faCheck} /> Marcar como finalizado
		</button>
	</form>
{/if}

{#if order.status === OrderStatus.FINISHED}
	<a
		class="flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-white shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
		target="_blank"
		aria-disabled="true"
		href={CustomerUtilites.getWhatsappLink(
			order.customer,
			OrderUtilites.getWhatsappFinishedText([order])
		)}
	>
		<Icon class="mr-2" data={faWhatsapp} /> Enviar mensaje finalizado
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
		<button
			class="flex w-full items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-white shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
		>
			<Icon class="mr-2" data={faClockRotateLeft} /> Marcar como pendiente
		</button>
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
		<button
			class="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
		>
			<Icon class="mr-2" data={faTruckPickup} /> Marcar como recogido
		</button>
	</form>
{/if}

<!-- View Customer and Day Orders Buttons -->
<a
	class="flex w-full items-center justify-center rounded-md bg-yellow-600 px-4 py-2 text-white shadow hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:ring-offset-2"
	href="/customers/{order.customer.id}"
>
	<Icon class="mr-2" data={faUser} /> Ver cliente
</a>

<button
	class="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2"
	on:click={() => {
		goto(`/orders/${order.id}/day`);
	}}
>
	<Icon class="mr-2" data={faBox} /> Pedidos del día
</button>

<script lang="ts">
	import Box from '$lib/components/Box.svelte';

	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import SubmitButton from '$lib/components/button/SubmitButton.svelte';
	import { PaymentStatus, CalculatedItemUtilities } from '@marcsimolduressonsardina/core';
	import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';
	import {
		ELIMINAR_COLORS,
		LISTADO_FINALIZADOS,
		MARCAR_PENDIENTE_COLORS
	} from '$lib/ui/ui.constants';
	import { faCircleXmark, faCoins } from '@fortawesome/free-solid-svg-icons';
	import Divider from '$lib/components/Divider.svelte';

	export let data: PageData;
	const order = data.order!;
	const calculatedItem = data.calculatedItem!;
	const totalOrder = CalculatedItemUtilities.getTotal(calculatedItem);
	let loading = false;
</script>

<Box title="Pagos">
	<div class="flex flex-col gap-2">
		{#if order.amountPayed > 0 && order.amountPayed !== totalOrder}
			<div class="flex flex-col">
				<div class="flex items-center text-lg text-gray-800 line-through">
					<span>{totalOrder.toFixed(2)} €</span>
				</div>
				<div class="flex items-center text-lg text-gray-800">
					<span>{order.amountPayed.toFixed(2)} € pagado</span>
				</div>
				<div class="flex items-center text-xl font-bold text-gray-800">
					<span>{(totalOrder - order.amountPayed).toFixed(2)} € pendiente</span>
				</div>
			</div>
		{:else}
			<div class="flex items-center text-xl font-bold text-gray-800">
				<span>{totalOrder.toFixed(2)} €</span>
			</div>
		{/if}

		<Divider></Divider>

		<form
			method="post"
			action="?/changePayment"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
		>
			<input type="hidden" name="paymentStatus" value={PaymentStatus.FULLY_PAID} />
			<SubmitButton text="Pagado" icon={faCheckCircle} colorClasses={LISTADO_FINALIZADOS}
			></SubmitButton>
		</form>

		<form
			method="post"
			action="?/changePayment"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
		>
			<input type="hidden" name="paymentStatus" value={PaymentStatus.UNPAID} />
			<SubmitButton text="No pagado" icon={faCircleXmark} colorClasses={ELIMINAR_COLORS}
			></SubmitButton>
		</form>

		<Divider></Divider>

		<form
			method="post"
			class="flex flex-col gap-2"
			action="?/changePayment"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
		>
			<input type="hidden" name="paymentStatus" value={PaymentStatus.PARTIALLY_PAID} />
			<input
				type="number"
				class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				name="amount"
				required
				placeholder="Cantidad EUR"
				step="0.01"
			/>
			<SubmitButton text="Pago a cuenta" icon={faCoins} colorClasses={MARCAR_PENDIENTE_COLORS}
			></SubmitButton>
		</form>
	</div>
</Box>

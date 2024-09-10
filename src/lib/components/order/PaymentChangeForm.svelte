<script lang="ts">
	import { enhance } from '$app/forms';
	import { faEdit } from '@fortawesome/free-solid-svg-icons';
	import Box from '../Box.svelte';
	import SubmitButton from '../button/SubmitButton.svelte';
	import { ACCIONES_NEUTRES_COLORS } from '$lib/ui/ui.constants';
	import { PaymentStatus } from '$lib/type/order.type';

	export let setFormLoading: (value: boolean) => void;

	let selectedStatus = PaymentStatus.FULLY_PAID;
</script>

<Box>
	<form
		method="post"
		action="?/changePayment"
		use:enhance={() => {
			setFormLoading(true);
			return async ({ update }) => {
				await update();
				setFormLoading(false);
			};
		}}
		class="space-y-4"
	>
		<div>
			<label class="block text-sm font-medium text-gray-700" for="location">Estado de pago</label>

			<div class="space-y-2">
				<select
					id="paymentStatus"
					name="paymentStatus"
					bind:value={selectedStatus}
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				>
					<option value={PaymentStatus.FULLY_PAID}>Marcar como pagado</option>
					<option value={PaymentStatus.UNPAID}>Marcar como no pagado</option>
					<option value={PaymentStatus.PARTIALLY_PAID}>Pago a cuenta</option>
				</select>

				{#if selectedStatus === PaymentStatus.PARTIALLY_PAID}
					<input
						type="number"
						class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						name="amount"
						required
						placeholder="Cantidad"
						step="0.01"
					/>
				{/if}
			</div>
		</div>
		<SubmitButton text="Aceptar" icon={faEdit} colorClasses={ACCIONES_NEUTRES_COLORS}
		></SubmitButton>
	</form>
</Box>

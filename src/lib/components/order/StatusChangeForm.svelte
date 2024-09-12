<script lang="ts">
	import { enhance } from '$app/forms';
	import { faEdit } from '@fortawesome/free-solid-svg-icons';
	import Box from '../Box.svelte';
	import SubmitButton from '../button/SubmitButton.svelte';
	import { ACCIONES_NEUTRES_COLORS } from '$lib/ui/ui.constants';
	import type { Order } from '$lib/type/api.type';
	import { orderStatusMap, OrderUtilites } from '$lib/shared/order.utilities';

	export let setFormLoading: (value: boolean) => void;
	export let order: Order;

	const statuses = OrderUtilites.getPossibleNextStatuses(order.status);
	let selectedStatus = statuses[0];
</script>

<Box>
	<form
		method="post"
		action="?/changeOrderStatus"
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
			<label class="block text-sm font-medium text-gray-700" for="location">Estado del pedido</label
			>
			<select
				id="status"
				name="status"
				bind:value={selectedStatus}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
			>
				{#each statuses as status}
					<option value={status}>{orderStatusMap[status]}</option>
				{/each}
			</select>
		</div>
		<SubmitButton text="Cambiar estado" icon={faEdit} colorClasses={ACCIONES_NEUTRES_COLORS}
		></SubmitButton>
	</form>
</Box>

<script lang="ts">
	import Box from '$lib/components/Box.svelte';

	import { orderStatusMap, OrderUtilites } from '$lib/shared/order.utilities';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import SubmitButton from '$lib/components/button/SubmitButton.svelte';
	import { getStatusUIInfo } from '$lib/ui/ui.helper';
	import { OrderStatus } from '@marcsimolduressonsardina/core';
	import Divider from '$lib/components/Divider.svelte';

	export let data: PageData;
	let loading = false;
	const statuses = OrderUtilites.getPossibleNextStatuses(data.order!.status);
	const locations = data.locations!;
	let selectedLocation = locations[0];
</script>

<Box title="Cambio de estado">
	<div class="flex flex-col gap-2">
		{#each statuses as status}
			<form
				class="space-y-2"
				method="post"
				action="?/changeOrderStatus"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
			>
				{#if status === OrderStatus.FINISHED}
					<label class="block text-sm font-medium text-gray-700" for="location">Ubicación:</label>
					<select
						id="location"
						name="location"
						bind:value={selectedLocation}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
					>
						{#each locations as location}
							<option value={location}>{location}</option>
						{/each}
					</select>
				{/if}
				<input type="hidden" name="status" value={status} />
				<SubmitButton
					text="Cambiar a {orderStatusMap[status]}"
					icon={getStatusUIInfo(status).statusIcon}
					colorClasses={getStatusUIInfo(status).colors}
				></SubmitButton>

				{#if status === OrderStatus.FINISHED}
					<Divider hideOnDesktop={false}></Divider>
				{/if}
			</form>
		{/each}
	</div>
</Box>

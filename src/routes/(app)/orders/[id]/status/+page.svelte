<script lang="ts">
	import Box from '$lib/components/Box.svelte';

	import { orderStatusMap, OrderUtilites } from '$lib/shared/order.utilities';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import SubmitButton from '$lib/components/button/SubmitButton.svelte';
	import { getStatusUIInfo } from '$lib/ui/ui.helper';

	export let data: PageData;
	let loading = false;
	const statuses = OrderUtilites.getPossibleNextStatuses(data.order!.status);
</script>

<Box title="Cambio de estado">
	<div class="flex flex-col gap-2">
		{#each statuses as status}
			<form
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
				<input type="hidden" name="status" value={status} />
				<SubmitButton
					text="Cambiar a {orderStatusMap[status]}"
					icon={getStatusUIInfo(status).statusIcon}
					colorClasses={getStatusUIInfo(status).colors}
				></SubmitButton>
			</form>
		{/each}
	</div>
</Box>

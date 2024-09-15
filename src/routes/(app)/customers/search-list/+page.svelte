<script lang="ts">
	import type { PageData } from './$types';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { faUserLarge } from '@fortawesome/free-solid-svg-icons/faUserLarge';
	import Button from '$lib/components/button/Button.svelte';
	import { PEDIDOS_COLORS } from '$lib/ui/ui.constants';

	export let data: PageData;
</script>

<div class="pl-3 pr-3 pt-3 text-lg font-medium">
	Búsqueda de clientes - {data.decodedSearchQuery}
</div>
<div class="space flex w-full flex-col gap-1 p-2">
	{#await data.customers}
		<ProgressBar text={'Buscando'} />
	{:then customers}
		<div class="flex w-full flex-col gap-1 lg:grid lg:grid-cols-4">
			{#each customers as customer}
				<Button
					textWhite={false}
					link={data.linkOrderId
						? `/orders/${data.linkOrderId}/link/${customer.id}`
						: `/customers/${customer.id}`}
					text={(data.linkOrderId ? 'Vincular a ' : '') + customer.name}
					icon={faUserLarge}
					colorClasses={PEDIDOS_COLORS}
				></Button>
			{/each}
		</div>
	{/await}
</div>

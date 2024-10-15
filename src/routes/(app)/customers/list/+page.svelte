<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { faUserLarge } from '@fortawesome/free-solid-svg-icons/faUserLarge';
	import { faMagnifyingGlassPlus } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlassPlus';
	import Button from '$lib/components/button/Button.svelte';
	import { ACCIONES_NEUTRES_COLORS, PEDIDOS_COLORS } from '$lib/ui/ui.constants';
	import type { Customer } from '@marcsimolduressonsardina/core';
	import { onMount } from 'svelte';
	import ClickButton from '$lib/components/button/ClickButton.svelte';

	let customers: Customer[] = [];
	let loading = false;
	let lastKey: Record<string, string | number> | undefined = undefined;

	async function loadCustomers() {
		loading = true;
		const response = await fetch('/api/customers/list', {
			method: 'POST',
			body: JSON.stringify({ lastKey }),
			headers: {
				'content-type': 'application/json'
			}
		});

		const customerPaginationResponse = (await response.json()) as {
			customers: Customer[];
			lastKey?: Record<string, string | number>;
		};

		customers = [...customers, ...customerPaginationResponse.customers];
		lastKey = customerPaginationResponse.lastKey;
		loading = false;
	}

	onMount(async () => {
		await loadCustomers();
	});
</script>

<div class="pl-3 pr-3 pt-3 text-lg font-medium">Listado de clientes</div>
<div class="space flex w-full flex-col gap-1 p-2">
	<div class="flex w-full flex-col gap-1 lg:grid lg:grid-cols-4">
		{#each customers as customer}
			<Button
				textWhite={false}
				link={`/customers/${customer.id}`}
				text={customer.name}
				icon={faUserLarge}
				colorClasses={PEDIDOS_COLORS}
			></Button>
		{/each}

		{#if lastKey}
			<ClickButton
				textWhite={true}
				colorClasses={ACCIONES_NEUTRES_COLORS}
				onClick={loadCustomers}
				text="Cargar más"
				icon={faMagnifyingGlassPlus}
			></ClickButton>
		{/if}
	</div>

	{#if loading}
		<ProgressBar text="Cargando clientes"></ProgressBar>
	{/if}
</div>

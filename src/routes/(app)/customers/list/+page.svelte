<script lang="ts">
	import type { PageData } from './$types';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { faUserLarge } from '@fortawesome/free-solid-svg-icons/faUserLarge';
	import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
	import { faAnglesLeft } from '@fortawesome/free-solid-svg-icons/faAnglesLeft';
	import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
	import Button from '$lib/components/button/Button.svelte';
	import { ACCIONES_NEUTRES_COLORS, PEDIDOS_COLORS } from '$lib/ui/ui.constants';

	export let data: PageData;
</script>

<div class="pl-3 pr-3 pt-3 text-lg font-medium">Listado de clientes</div>
<div class="space flex w-full flex-col gap-1 p-2">
	{#await data.paginatedResult}
		<ProgressBar />
	{:then paginatedResult}
		<div class="flex flex-row gap-1 py-2">
			{#if !data.isFirstPage}
				{#if data.prev}
					<Button
						link={`/customers/list`}
						text=""
						icon={faAnglesLeft}
						colorClasses={ACCIONES_NEUTRES_COLORS}
					></Button>
					<Button
						link={`/customers/list?next=${data.prev}&history=${data.prevHistoryStackString}`}
						text=""
						icon={faChevronLeft}
						colorClasses={ACCIONES_NEUTRES_COLORS}
					></Button>
				{:else}
					<Button
						link={`/customers/list`}
						text=""
						icon={faChevronLeft}
						colorClasses={ACCIONES_NEUTRES_COLORS}
					></Button>
				{/if}
			{/if}

			{#if paginatedResult.nextKey}
				<Button
					link={`/customers/list?next=${paginatedResult.nextKey}&history=${data.nextHistoryStackString}`}
					text=""
					icon={faChevronRight}
					colorClasses={ACCIONES_NEUTRES_COLORS}
				></Button>
			{/if}
		</div>

		<div class="flex w-full flex-col gap-1 lg:grid lg:grid-cols-4">
			{#each paginatedResult.customers as customer}
				<Button
					textWhite={false}
					link={`/customers/${customer.id}`}
					text={customer.name}
					icon={faUserLarge}
					colorClasses={PEDIDOS_COLORS}
				></Button>
			{/each}
		</div>

		<div class="flex flex-row gap-1 py-2">
			{#if !data.isFirstPage}
				{#if data.prev}
					<Button
						link={`/customers/list`}
						text=""
						icon={faAnglesLeft}
						colorClasses={ACCIONES_NEUTRES_COLORS}
					></Button>
					<Button
						link={`/customers/list?next=${data.prev}&history=${data.prevHistoryStackString}`}
						text=""
						icon={faChevronLeft}
						colorClasses={ACCIONES_NEUTRES_COLORS}
					></Button>
				{:else}
					<Button
						link={`/customers/list`}
						text=""
						icon={faChevronLeft}
						colorClasses={ACCIONES_NEUTRES_COLORS}
					></Button>
				{/if}
			{/if}

			{#if paginatedResult.nextKey}
				<Button
					link={`/customers/list?next=${paginatedResult.nextKey}&history=${data.nextHistoryStackString}`}
					text=""
					icon={faChevronRight}
					colorClasses={ACCIONES_NEUTRES_COLORS}
				></Button>
			{/if}
		</div>
	{/await}
</div>

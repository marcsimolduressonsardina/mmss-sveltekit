<script lang="ts">
	import type { PageData } from './$types';
	import { Table, tableMapperValues, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import type { TableSource } from '@skeletonlabs/skeleton';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { PricingFormula, PricingType } from '$lib/type/pricing.type';
	import { writable } from 'svelte/store';
	import { emptyPricing, formulasMap } from '$lib/shared/pricing.utilites';
	import type { ListPrice, MaxArea } from '$lib/type/api.type';
	import { goto } from '$app/navigation';

	export let data: PageData;
	let pricingData = writable(emptyPricing);
	let selectedType: PricingType = PricingType.MOLD;
	let tableSource: TableSource = { head: [], body: [] };

	data.pricing.then((pricing) => {
		pricingData.set(pricing);
		tableSource = generatTableSource(selectedType);
	});

	$: {
		tableSource = generatTableSource(selectedType);
	}

	function getPriceLabel(price: number, formula: PricingFormula, areas: MaxArea[]): string {
		if (formula === PricingFormula.FORMULA_FIT_AREA) {
			const prices = areas.map((a) => a.price);
			const max = Math.max(...prices);
			const min = Math.min(...prices);
			return `${min.toFixed(2)} - ${max.toFixed(2)} €`;
		} else {
			return price.toFixed(2) + ' €';
		}
	}

	function getPricingListByType(type: PricingType): ListPrice[] {
		const pricing = $pricingData;
		switch (type) {
			case PricingType.GLASS:
				return pricing.glassPrices;
			case PricingType.BACK:
				return pricing.backPrices;
			case PricingType.PP:
				return pricing.ppPrices;
			case PricingType.OTHER:
				return pricing.otherPrices;
			case PricingType.LABOUR:
				return pricing.labourPrices;
			default:
				return [];
		}
	}

	function generatTableSource(type: PricingType): TableSource {
		const pricing = $pricingData;
		if (type === PricingType.MOLD) {
			return generateMoldTableSource();
		}

		const sourceData = getPricingListByType(type).map((i) => {
			return {
				id: i.id,
				internalId: i.internalId,
				description: i.description,
				price: getPriceLabel(i.price, i.formula, i.areas),
				formula: formulasMap[i.formula]
			};
		});
		return {
			head: ['ID', 'Descripción', 'Precio', 'Fórmula'],
			body: tableMapperValues(sourceData, ['id', 'description', 'price', 'formula']),
			meta: tableMapperValues(sourceData, ['internalId'])
		};
	}

	function generateMoldTableSource(): TableSource {
		const pricing = $pricingData;
		return {
			head: ['ID', 'Precio'],
			body: tableMapperValues(
				pricing.moldPrices.map((p) => ({
					description: p.description,
					price: p.price.toFixed(2) + ' €'
				})),
				['description', 'price']
			),
			meta: tableMapperValues(pricing.moldPrices, ['internalId'])
		};
	}

	function handleSelected(event: any) {
		const internalId = event.detail[0] as string;
		const url = `/prices/${internalId}`;
		goto(url);
	}
</script>

<div class="px-2 pt-1 text-xl font-semibold">Listado de precios</div>
<div class="flex w-full flex-col place-content-center items-center justify-center space-y-2 p-4">
	{#await data.pricing}
		<ProgressBar />
	{:then pricing}
		<RadioGroup display="flex" class="w-full">
			<RadioItem bind:group={selectedType} name="justify" value={PricingType.MOLD}>Marco</RadioItem>
			<RadioItem bind:group={selectedType} name="justify" value={PricingType.OTHER}>Otros</RadioItem
			>
			<RadioItem bind:group={selectedType} name="justify" value={PricingType.BACK}
				>Trasera</RadioItem
			>
			<RadioItem bind:group={selectedType} name="justify" value={PricingType.GLASS}
				>Cristal</RadioItem
			>
			<RadioItem bind:group={selectedType} name="justify" value={PricingType.PP}>PP</RadioItem>
			<RadioItem bind:group={selectedType} name="justify" value={PricingType.LABOUR}
				>Montajes</RadioItem
			>
		</RadioGroup>

		<Table interactive={true} source={tableSource} on:selected={handleSelected} />
	{:catch error}
		<p>{error.message}</p>
	{/await}
</div>

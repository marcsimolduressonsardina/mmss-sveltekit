<script lang="ts">
	import type { PageData } from './$types';
	import { Table, tableMapperValues, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import type { TableSource } from '@skeletonlabs/skeleton';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { PricingFormula, PricingType } from '$lib/type/pricing.type';
	import { writable } from 'svelte/store';
	import {
		emptyPricing,
		fitFormulas,
		formulasMap,
		pricingTypesMap
	} from '$lib/shared/pricing.utilites';
	import type { ListPrice, MaxArea, MaxAreaM2 } from '$lib/type/api.type';
	import { goto } from '$app/navigation';
	import { Icon } from 'svelte-awesome';
	import plus from 'svelte-awesome/icons/plus';

	export let data: PageData;
	let pricingData = writable(emptyPricing);
	let selectedType: PricingType = data.pricingType;
	let tableSource: TableSource = { head: [], body: [] };

	data.pricing.then((pricing) => {
		pricingData.set(pricing);
		tableSource = generatTableSource(selectedType);
	});

	$: {
		tableSource = generatTableSource(selectedType);
	}

	function getPriceLabel(
		price: number,
		formula: PricingFormula,
		areas: (MaxArea | MaxAreaM2)[]
	): string {
		if (fitFormulas.includes(formula)) {
			const prices = areas.map((a) => a.price);
			const max = Math.max(...prices);
			const min = Math.min(...prices);
			return `${min.toFixed(2)} - ${max.toFixed(2)} €`;
		} else {
			return price.toFixed(2) + ' €';
		}
	}

	function sortPricing(priceList: ListPrice[]): ListPrice[] {
		return priceList.sort((a, b) => b.priority - a.priority);
	}

	function getPricingListByType(type: PricingType): ListPrice[] {
		const pricing = $pricingData;
		switch (type) {
			case PricingType.GLASS:
				return sortPricing(pricing.glassPrices);
			case PricingType.BACK:
				return sortPricing(pricing.backPrices);
			case PricingType.PP:
				return sortPricing(pricing.ppPrices);
			case PricingType.OTHER:
				return sortPricing(pricing.otherPrices);
			case PricingType.LABOUR:
				return sortPricing(pricing.labourPrices);
			case PricingType.TRANSPORT:
				return sortPricing(pricing.transportPrices);
			case PricingType.HANGER:
				return sortPricing(pricing.hangerPrices);
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
				price: getPriceLabel(i.price, i.formula, [...i.areas, ...i.areasM2]),
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
		const url = `/config/prices/${internalId}`;
		goto(url);
	}
</script>

<div class="flex items-center px-2 pt-1">
	<h2 class="text-xl font-semibold">Listado de precios</h2>
	<a
		class="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-700 text-white shadow hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-800 focus:ring-offset-2"
		aria-label="Añadir nuevo precio"
		href="/config/prices/new"
	>
		<Icon data={plus} class="h-3 w-3" />
	</a>
</div>
<div class="flex w-full flex-col place-content-center items-center justify-center space-y-2 p-4">
	{#await data.pricing}
		<ProgressBar />
	{:then pricing}
		<RadioGroup display="flex" class="w-full">
			<RadioItem bind:group={selectedType} name="justify" value={PricingType.MOLD}>Marco</RadioItem>
			<RadioItem bind:group={selectedType} name="justify" value={PricingType.OTHER}>
				{pricingTypesMap[PricingType.OTHER]}
			</RadioItem>
			<RadioItem bind:group={selectedType} name="justify" value={PricingType.BACK}>
				{pricingTypesMap[PricingType.BACK]}
			</RadioItem>
			<RadioItem bind:group={selectedType} name="justify" value={PricingType.GLASS}>
				{pricingTypesMap[PricingType.GLASS]}
			</RadioItem>
			<RadioItem bind:group={selectedType} name="justify" value={PricingType.PP}>
				{pricingTypesMap[PricingType.PP]}
			</RadioItem>
			<RadioItem bind:group={selectedType} name="justify" value={PricingType.LABOUR}>
				{pricingTypesMap[PricingType.LABOUR]}
			</RadioItem>
			<RadioItem bind:group={selectedType} name="justify" value={PricingType.TRANSPORT}>
				{pricingTypesMap[PricingType.TRANSPORT]}
			</RadioItem>
			<RadioItem bind:group={selectedType} name="justify" value={PricingType.HANGER}>
				{pricingTypesMap[PricingType.HANGER]}
			</RadioItem>
		</RadioGroup>

		<Table interactive={true} source={tableSource} on:selected={handleSelected} />
	{:catch error}
		<p>{error.message}</p>
	{/await}
</div>

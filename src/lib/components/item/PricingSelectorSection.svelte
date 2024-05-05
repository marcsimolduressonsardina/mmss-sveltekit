<script lang="ts">
	import type { PricingType } from '$lib/type/pricing.type';
	import Icon from 'svelte-awesome';
	import plus from 'svelte-awesome/icons/plus';
	import Spacer from './Spacer.svelte';
	import type { ListPrice } from '$lib/type/api.type';
	import { getPriceString } from '$lib/shared/pricing.utilites';

	export let sectionTitle: string;
	export let label: string;
	export let addValue: (pricingType: PricingType, value?: string) => void;
	export let pricingType: PricingType;
	export let prices: ListPrice[];
	export let added: boolean;

	let idElementInput: HTMLSelectElement;
	let selectedId = '';

	function getSelectLabel(price: ListPrice) {
		if (price.description == null || price.description === '') {
			return `${price.id} (${getPriceString(price)})`;
		}
		return `${price.description} (${getPriceString(price)})`;
	}

	function addFunction() {
		if (!isButtonDisabled) {
			addValue(pricingType, idElementInput.value);
			idElementInput.value = '';
		}
	}

	let defaultPrices = prices.filter((p) => p.isDefault === true);
	let normalPrices = prices.filter((p) => p.isDefault !== true);
	let firstPrice: ListPrice;
	if (defaultPrices.length > 0) {
		firstPrice = defaultPrices[0];
		normalPrices = defaultPrices.slice(1).concat(normalPrices);
		selectedId = firstPrice.id;
	}

	console.log(defaultPrices);

	$: isButtonDisabled = !selectedId;
</script>

<Spacer title={sectionTitle} />
<label class="label lg:col-span-2">
	<span>{label}: </span>
	<div class="space-y-2 lg:grid lg:grid-cols-2 lg:space-x-2 lg:space-y-0">
		<select
			class="select"
			name="moldingId"
			bind:value={selectedId}
			bind:this={idElementInput}
			class:input-success={added}
		>
			{#if firstPrice}
				<option value={firstPrice.id}>{getSelectLabel(firstPrice)}</option>
			{:else}
				<option></option>
			{/if}

			{#each normalPrices as price}
				<option value={price.id}>{getSelectLabel(price)}</option>
			{/each}
		</select>
		<button
			class="variant-filled btn w-full lg:w-auto"
			type="button"
			on:click={() => addFunction()}
		>
			<Icon class="mr-2" data={plus} /> Añadir a la lista
		</button>
	</div>
</label>

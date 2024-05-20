<script lang="ts">
	import { PricingType } from '$lib/type/pricing.type';
	import Icon from 'svelte-awesome';
	import plus from 'svelte-awesome/icons/plus';
	import Spacer from './Spacer.svelte';
	import type { ListPrice } from '$lib/type/api.type';

	export let sectionTitle: string;
	export let label: string;
	export let addValue: (pricingType: PricingType, value?: string) => void;
	export let pricingType: PricingType;
	export let prices: ListPrice[];
	export let added: boolean;
	export let canBeAdded: boolean = true;

	let idElementInput: HTMLSelectElement;
	let selectedId = '';

	function getSelectLabel(price: ListPrice): string {
		return price.description ?? price.id;
	}

	function addFunction() {
		if (!isButtonDisabled) {
			addValue(pricingType, idElementInput.value);
		}
	}

	let defaultPrices = prices.filter((p) => p.priority > 0).sort((a, b) => b.priority - a.priority);
	let normalPrices = prices.filter((p) => p.priority === 0 || p.priority == null);
	if (defaultPrices.length > 0) {
		selectedId = defaultPrices[0].id;
	}

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
			{#each defaultPrices as price}
				<option value={price.id}>{getSelectLabel(price)}</option>
			{/each}

			<option></option>
			{#each normalPrices as price}
				<option value={price.id}>{getSelectLabel(price)}</option>
			{/each}
		</select>
		<button
			class="variant-filled btn w-full lg:w-auto"
			type="button"
			disabled={!canBeAdded}
			on:click={() => addFunction()}
		>
			<Icon class="mr-2" data={plus} /> Añadir a la lista
		</button>
	</div>
</label>

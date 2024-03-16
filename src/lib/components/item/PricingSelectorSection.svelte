<script lang="ts">
	import type { ListPriceDto } from '$lib/server/repository/dto/list-price.dto';
	import type { PricingType } from '$lib/type/pricing.type';
	import Icon from 'svelte-awesome';
	import plus from 'svelte-awesome/icons/plus';
	import Spacer from './Spacer.svelte';

	export let sectionTitle: string;
	export let label: string;
	export let addValue: (pricingType: PricingType, value?: string) => void;
	export let pricingType: PricingType;
	export let prices: ListPriceDto[];

	let idElementInput: HTMLSelectElement;

	function getSelectLabel(price: ListPriceDto) {
		if (price.description == null || price.description === '') {
			return `${price.id}`;
		}
		return `${price.description}`;
	}

	function addFunction() {
		addValue(pricingType, idElementInput.value);
	}
</script>

<Spacer title={sectionTitle} />
<label class="label lg:col-span-2">
	<span>{label}: </span>
	<div class="space-y-2 lg:grid lg:grid-cols-2 lg:space-x-2 lg:space-y-0">
		<select class="select" name="moldingId" bind:this={idElementInput}>
			{#each prices as price}
				<option value={price.id}>{getSelectLabel(price)}</option>
			{/each}
		</select>
		<button class="variant-filled btn w-full lg:w-auto" type="button" on:click={() => addFunction()}
			><Icon class="mr-2" data={plus} /> Añadir a la lista</button
		>
	</div>
</label>

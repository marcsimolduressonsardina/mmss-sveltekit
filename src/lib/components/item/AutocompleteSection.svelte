<script lang="ts">
	import { Autocomplete, popup } from '@skeletonlabs/skeleton';
	import type { AutocompleteOption, PopupSettings } from '@skeletonlabs/skeleton';

	import Icon from 'svelte-awesome';
	import plus from 'svelte-awesome/icons/plus';
	import Spacer from './Spacer.svelte';
	import {
		PricingUtilites,
		type ListPrice,
		type PricingType
	} from '@marcsimolduressonsardina/core';
	import { formulasStringMap } from '$lib/shared/pricing.utilites';

	export let sectionTitle: string;
	export let label: string;
	export let addValue: (pricingType: PricingType, value?: string) => void;
	export let pricingType: PricingType;
	export let prices: ListPrice[];
	export let added: boolean;

	let autocompleteInput = '';

	let popupSettings: PopupSettings = {
		event: 'focus-click',
		target: 'popupAutocomplete',
		placement: 'bottom'
	};

	function getSelectLabel(price: ListPrice) {
		if (price.description == null || price.description === '') {
			return `${price.id} (${PricingUtilites.getPriceString(price, formulasStringMap)})`;
		}
		return `${price.description} (${PricingUtilites.getPriceString(price, formulasStringMap)})`;
	}

	function addFunction() {
		if (!isButtonDisabled) {
			addValue(pricingType, autocompleteInput);
		}
	}

	function onPopupSelect(event: CustomEvent<AutocompleteOption<string>>): void {
		autocompleteInput = event.detail.value;
	}

	const options: AutocompleteOption<string>[] = prices.map((price) => {
		return {
			value: price.id,
			label: getSelectLabel(price)
		};
	});

	$: isButtonDisabled = !prices.some((price) => price.id === autocompleteInput);
</script>

<Spacer title={sectionTitle} />
<label class="label lg:col-span-2">
	<span>{label}: </span>
	<div class="gap-2 space-y-2 lg:grid lg:grid-cols-2 lg:space-y-0">
		<div class="text-token w-full space-y-2">
			<input
				class="autocomplete input"
				type="search"
				name="autocomplete-search"
				bind:value={autocompleteInput}
				placeholder="Referencia..."
				use:popup={popupSettings}
				class:input-success={added}
			/>
			<div
				data-popup="popupAutocomplete"
				class="card max-h-48 w-full max-w-sm overflow-y-auto p-4"
				tabindex="-1"
			>
				<Autocomplete bind:input={autocompleteInput} {options} on:selection={onPopupSelect} />
			</div>
		</div>
		<button
			class="variant-filled btn w-full lg:w-auto"
			type="button"
			on:click={() => addFunction()}
		>
			<Icon class="mr-2" data={plus} /> Añadir a la lista
		</button>
	</div>
</label>

<script lang="ts">
	import { PricingType } from '$lib/type/pricing.type';
	import Icon from 'svelte-awesome';
	import plus from 'svelte-awesome/icons/plus';
	import Spacer from './Spacer.svelte';
	import type { ListPriceForm } from '$lib/type/api.type';

	export let sectionTitle: string;
	export let label: string;
	export let addValue: (pricingType: PricingType, value?: string, moldId?: string) => void;
	export let prices: ListPriceForm[];
	export let added: boolean;
	export let canBeAdded: boolean = true;

	let idElementInput: HTMLSelectElement;
	let selectedId = '';

	function getSelectLabel(price: ListPriceForm): string {
		return price.description ?? price.id;
	}

	function addFunction() {
		if (!isButtonDisabled) {
			const element = pricesMap.get(idElementInput.value)!;
			addValue(element.type, element.id, element.moldId);
		}
	}

	let pricesMap = new Map<string, ListPriceForm>();

	function generateMap(ps: ListPriceForm[]) {
		const pm = new Map<string, ListPriceForm>();
		ps.forEach((p) => {
			pm.set(getId(p), p);
		});

		pricesMap = pm;
	}

	function getId(p: ListPriceForm): string {
		return `${p.id}${p.moldId ? '_' + p.moldId : ''}`;
	}

	function updateSelectedId(df: ListPriceForm[]) {
		if (df && df.length > 0 && selectedId === '') {
			selectedId = getId(df[0]);
		}
	}

	$: defaultPrices = prices.filter((p) => p.priority > 0).sort((a, b) => b.priority - a.priority);
	$: normalPrices = prices.filter((p) => p.priority === 0 || p.priority == null);
	$: generateMap(prices);
	$: updateSelectedId(defaultPrices);
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
				<option data-mold={price.moldId} value={getId(price)}>{getSelectLabel(price)}</option>
			{/each}

			<option></option>
			{#each normalPrices as price}
				<option value={getId(price)}>{getSelectLabel(price)}</option>
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

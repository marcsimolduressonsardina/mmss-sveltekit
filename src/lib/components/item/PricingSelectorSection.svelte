<script lang="ts">
	import { PricingType } from '$lib/type/pricing.type';
	import Icon from 'svelte-awesome';
	import plus from 'svelte-awesome/icons/plus';
	import Spacer from './Spacer.svelte';
	import type { ListPriceForm } from '$lib/type/api.type';

	export let sectionTitle: string;
	export let label: string;
	export let addValue: (
		pricingType: PricingType,
		value?: string,
		moldId?: string,
		extraInfo?: string
	) => void;
	export let prices: ListPriceForm[];
	export let canBeAdded: boolean = true;
	export let showExtraInfo: boolean = false;
	export let added: boolean;

	let idElementInput: HTMLSelectElement;
	let extraInfo: string | undefined = undefined;
	let selectedId = '';

	function getSelectLabel(price: ListPriceForm): string {
		return price.description ?? price.id;
	}

	function addFunction() {
		if (!isButtonDisabled) {
			const element = pricesMap.get(idElementInput.value)!;
			addValue(element.type, element.id, element.moldId, showExtraInfo ? extraInfo : undefined);
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
<div class="lg:col-span-2">
	<div class="gap-2 space-y-2 lg:grid lg:grid-cols-2 lg:space-y-0">
		<label class="label" for="priceId">
			<span>{label}: </span>
			<select
				class="select"
				name="priceId"
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
		</label>
		{#if showExtraInfo}
			<label class="label" for="extraInfoValue">
				<span>Otra información: </span>
				<input class="input" type="text" name="extraInfoValue" bind:value={extraInfo} />
			</label>
			<div class="w-full lg:col-span-2 lg:w-auto">
				<button
					class="variant-filled btn w-full"
					type="button"
					disabled={!canBeAdded}
					on:click={() => addFunction()}
				>
					<Icon class="mr-2" data={plus} /> Añadir a la lista
				</button>
			</div>
		{:else}
			<div class="mt-auto w-full pt-6 lg:w-auto">
				<button
					class="variant-filled btn w-full"
					type="button"
					disabled={!canBeAdded}
					on:click={() => addFunction()}
				>
					<Icon class="mr-2" data={plus} /> Añadir a la lista
				</button>
			</div>
		{/if}
	</div>
</div>

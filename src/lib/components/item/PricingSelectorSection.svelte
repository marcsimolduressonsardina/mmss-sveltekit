<script lang="ts">
	import Icon from 'svelte-awesome';
	import plus from 'svelte-awesome/icons/plus';
	import Spacer from './Spacer.svelte';
	import type { ListPriceWithMold, PricingType } from '@marcsimolduressonsardina/core';

	export let sectionTitle: string;
	export let label: string;
	export let addValue: (
		pricingType: PricingType,
		value?: string,
		moldId?: string,
		extraInfo?: string
	) => void;
	export let prices: ListPriceWithMold[];
	export let extraPrices: ListPriceWithMold[] = [];
	export let locationIdForExtraPrices: string | undefined = undefined;
	export let priorityFirst: boolean = true;
	export let showExtraInfo: boolean = false;
	export let added: boolean;

	let idElementInput: HTMLSelectElement;
	let extraInfo: string | undefined = undefined;
	let selectedId = '';

	function getSelectLabel(price: ListPriceWithMold): string {
		return price.description ?? price.id;
	}

	function addFunction() {
		if (!isButtonDisabled) {
			const element = pricesMap.get(idElementInput.value)!;
			addValue(element.type, element.id, element.moldId, showExtraInfo ? extraInfo : undefined);
		}
	}

	let pricesMap = new Map<string, ListPriceWithMold>();

	function generateMap(ps: ListPriceWithMold[]) {
		const pm = new Map<string, ListPriceWithMold>();
		ps.forEach((p) => {
			pm.set(getId(p), p);
		});

		pricesMap = pm;
	}

	function getId(p: ListPriceWithMold): string {
		return `${p.id}${p.moldId ? '_' + p.moldId : ''}`;
	}

	function updateSelectedId(df: ListPriceWithMold[]) {
		if (priorityFirst && df && df.length > 0 && selectedId === '') {
			selectedId = getId(df[0]);
		}
	}

	function insertElementsBeforeKey(
		originalArray: ListPriceWithMold[],
		newArray: ListPriceWithMold[],
		key: string
	): ListPriceWithMold[] {
		const keyIndex = originalArray.findIndex((p) => p.id === key);
		if (keyIndex === -1) {
			return originalArray;
		}

		return [...originalArray.slice(0, keyIndex), ...newArray, ...originalArray.slice(keyIndex)];
	}

	function getDefaultPrices(
		pi: ListPriceWithMold[],
		epi: ListPriceWithMold[],
		keyFound: boolean,
		key?: string
	): ListPriceWithMold[] {
		const defaultPrices = pi.filter((p) => p.priority > 0).sort((a, b) => b.priority - a.priority);
		if (!keyFound || key == null) {
			return [...defaultPrices, ...epi]
				.filter((p) => p.priority > 0)
				.sort((a, b) => b.priority - a.priority);
		} else {
			return insertElementsBeforeKey(defaultPrices, epi, key);
		}
	}

	function getNormalPrices(
		pi: ListPriceWithMold[],
		epi: ListPriceWithMold[],
		keyFound: boolean,
		key?: string
	): ListPriceWithMold[] {
		const normalPrices = pi.filter((p) => p.priority === 0);
		if (!keyFound || key == null) {
			return [...normalPrices, ...epi].filter((p) => p.priority === 0);
		} else {
			return insertElementsBeforeKey(normalPrices, epi, key);
		}
	}

	$: keyFound =
		locationIdForExtraPrices !== null &&
		prices.findIndex((p) => p.id === locationIdForExtraPrices) > -1;
	$: defaultPrices = getDefaultPrices(prices, extraPrices, keyFound, locationIdForExtraPrices);
	$: normalPrices = getNormalPrices(prices, extraPrices, keyFound, locationIdForExtraPrices);
	$: generateMap([...prices, ...extraPrices]);
	$: updateSelectedId(defaultPrices);
	$: isButtonDisabled = !selectedId;
	$: canBeAdded = !showExtraInfo || (extraInfo != null && extraInfo?.length > 0);
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
				{#if priorityFirst}
					{#each defaultPrices as price}
						<option data-mold={price.moldId} value={getId(price)}>{getSelectLabel(price)}</option>
					{/each}
					<option></option>
				{:else}
					<option></option>
					{#each defaultPrices as price}
						<option data-mold={price.moldId} value={getId(price)}>{getSelectLabel(price)}</option>
					{/each}
				{/if}
				{#each normalPrices as price}
					<option value={getId(price)}>{getSelectLabel(price)}</option>
				{/each}
			</select>
		</label>
		{#if showExtraInfo}
			<label class="label" for="extraInfoValue">
				<span>Número: </span>
				<input
					class:input-success={added}
					class="input"
					type="text"
					name="extraInfoValue"
					bind:value={extraInfo}
				/>
			</label>
			<div class="w-full lg:col-span-2 lg:w-auto">
				<button
					class="variant-filled btn w-full"
					type="button"
					disabled={!canBeAdded}
					on:click={() => addFunction()}
				>
					<Icon class="mr-2" data={plus} /> Añadir a la lista {#if !canBeAdded}
						(Falta número)
					{/if}
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

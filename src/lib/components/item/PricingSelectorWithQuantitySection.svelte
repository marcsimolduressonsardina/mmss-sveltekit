<script lang="ts">
	import Icon from 'svelte-awesome';
	import plus from 'svelte-awesome/icons/plus';
	import Spacer from './Spacer.svelte';
	import type { ListPrice } from '$lib/type/api.type';

	export let added: Boolean;
	export let sectionTitle: string;
	export let label: string;
	export let priorityFirst: boolean = true;
	export let prices: ListPrice[];
	export let addItem: (id: string, quantity: number) => void;

	let predefinedElementInput: HTMLSelectElement;
	let predefinedQuantityElementInput: HTMLSelectElement;

	function addElement() {
		const inputElement = predefinedElementInput;
		const value = inputElement ? (inputElement.value as string) : null;
		const quantityElement = predefinedQuantityElementInput;
		const quantity = quantityElement ? Number(quantityElement.value) : null;
		if (value != null && quantity != null) {
			addItem(value, quantity);
		}

		if (quantityElement) {
			quantityElement.value = '1';
		}
	}
</script>

<Spacer title={sectionTitle} />
<label class="label" for="predefinedElements">
	<span>{label}:</span>
	<select
		class="select"
		name="predefinedElements"
		id="predefinedElements"
		class:input-success={added}
		bind:this={predefinedElementInput}
	>
		{#if !priorityFirst}
			<option></option>
		{/if}
		{#each prices.sort((a, b) => b.priority - a.priority) as otherPrice}
			<option value={otherPrice.id}
				>{otherPrice.description} ({otherPrice.price.toFixed(2)} €)</option
			>
		{/each}
	</select>
</label>
<label class="label">
	<span>Cantidad</span>
	<select
		class="select"
		name="predefinedQuantityElements"
		bind:this={predefinedQuantityElementInput}
	>
		{#each Array(10) as _, i (i)}
			<option value={i + 1}>{i + 1}</option>
		{/each}
	</select>
</label>

<button
	class="variant-filled btn lg:col-span-2"
	type="button"
	on:click={() => {
		addElement();
	}}><Icon class="mr-2" data={plus} /> Añadir a la lista</button
>

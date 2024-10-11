<script lang="ts">
	import { faCartPlus } from '@fortawesome/free-solid-svg-icons/faCartPlus';
	import type { CalculatedItemPart } from '@marcsimolduressonsardina/core';
	import Icon from 'svelte-awesome';
	import trash from 'svelte-awesome/icons/trash';

	export let part: CalculatedItemPart;
	export let partToDelete: any = {};
	export let deleteExtraPart: (partToDelete: any) => void = (p: any) => {};
	export let hideDeleteButton: boolean = false;
</script>

<div>
	<span class="badge bg-green-200"><Icon data={faCartPlus} /></span>
	<span class="flex-auto">
		<dt>{part.description} x {part.quantity}</dt>
		<dd>{(part.price * part.quantity).toFixed(2)} €</dd>
	</span>
	{#if !hideDeleteButton}
		<button type="button" class="btn bg-indigo-300" on:click={() => deleteExtraPart(partToDelete)}
			><Icon class="mr-2" data={trash} /> Eliminar</button
		>
	{/if}
</div>

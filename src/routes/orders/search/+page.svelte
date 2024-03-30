<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { Icon } from 'svelte-awesome';
	import search from 'svelte-awesome/icons/search';
	import { superForm } from 'sveltekit-superforms';

	export let data;
	const { form, errors, enhance, submitting } = superForm(data.form);
</script>

<div class="px-2 pt-1 text-xl font-semibold">Consultar pedido</div>
<div class="flex w-full flex-col place-content-center px-2">
	{#if $submitting}
		<ProgressBar />
	{:else}
		<form use:enhance class="w-full space-y-2" method="post">
			<div class="grid grid-cols-3"></div>
			<label class="label" for="id">
				<span>Identificador:</span>
				<input
					class="input {$errors.id ? 'input-error' : ''}"
					id="id"
					type="text"
					name="id"
					placeholder="Ejemplo: 20240315/46/34612345678"
					bind:value={$form.id}
				/>
			</label>
			<button class="variant-filled-warning btn w-full" type="submit"
				><Icon class="mr-2" data={search} /> Buscar</button
			>
		</form>
	{/if}
</div>

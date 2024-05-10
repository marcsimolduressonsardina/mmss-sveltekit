<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { Icon } from 'svelte-awesome';
	import search from 'svelte-awesome/icons/search';
	import { superForm } from 'sveltekit-superforms';

	export let data;
	const { form, errors, enhance, submitting } = superForm(data.form);
</script>

<div class="px-2 pt-1 text-xl font-semibold">Buscar Cliente</div>
<div class="flex w-full flex-col place-content-center px-2">
	{#if $submitting}
		<ProgressBar />
	{:else}
		<form use:enhance class="w-full space-y-2" method="post">
			<label class="label" for="phone">
				<span>Teléfono:</span>
				<input
					class="input {$errors.phone ? 'input-error' : ''}"
					id="phone"
					type="tel"
					name="phone"
					bind:value={$form.phone}
				/>
			</label>

			<button class="variant-filled-warning btn w-full" type="submit"
				><Icon class="mr-2" data={search} /> Buscar</button
			>
		</form>
	{/if}
</div>

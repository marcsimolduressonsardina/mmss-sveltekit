<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { Icon } from 'svelte-awesome';
	import search from 'svelte-awesome/icons/search';
	import { superForm } from 'sveltekit-superforms';
	import Box from '$lib/components/Box.svelte';

	export let data;
	const { form, errors, enhance, submitting } = superForm(data.form);
</script>

<Box title="Consultar pedido">
	{#if $submitting}
		<ProgressBar />
	{:else}
		<form use:enhance class="space-y-4" method="post">
			<div>
				<label class="block text-sm font-medium text-gray-700" for="id">Identificador:</label>
				<input
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
					class:input-error={$errors.id}
					id="id"
					type="text"
					name="id"
					placeholder="Ejemplo: 20240315/AB/34612345678"
					bind:value={$form.id}
				/>
			</div>

			<button
				class="w-full rounded-md bg-yellow-500 px-4 py-2 font-semibold text-white shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
				type="submit"
			>
				<Icon class="mr-2" data={search} />
				Buscar
			</button>
		</form>
	{/if}
</Box>

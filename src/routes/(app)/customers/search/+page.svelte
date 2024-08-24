<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { Icon } from 'svelte-awesome';
	import search from 'svelte-awesome/icons/search';
	import { faList } from '@fortawesome/free-solid-svg-icons/faList';
	import { superForm } from 'sveltekit-superforms';
	import Box from '$lib/components/Box.svelte';

	export let data;
	const { form, errors, enhance, submitting } = superForm(data.form);
</script>

<Box title={'Buscar Cliente'}>
	{#if $submitting}
		<ProgressBar />
	{:else}
		<form use:enhance class="space-y-3" method="post">
			<div>
				<label class="block text-sm font-medium text-gray-700" for="phone">Teléfono:</label>
				<input
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
					class:input-error={$errors.phone}
					id="phone"
					type="tel"
					name="phone"
					bind:value={$form.phone}
				/>
			</div>

			<div class="flex flex-col space-y-3 md:flex-row md:space-x-3 md:space-y-0">
				<button
					class="w-full rounded-md bg-yellow-500 px-4 py-2 font-semibold text-white shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
					type="submit"
				>
					<Icon class="mr-2" data={search} />
					Buscar
				</button>

				<a
					class="w-full rounded-md bg-indigo-500 px-4 py-2 text-center font-semibold text-white shadow hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					href="/customers/list"
				>
					<Icon class="mr-2" data={faList} />
					Ver listado
				</a>
			</div>
		</form>
	{/if}
</Box>

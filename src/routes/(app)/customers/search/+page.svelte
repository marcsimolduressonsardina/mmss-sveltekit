<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import search from 'svelte-awesome/icons/search';
	import { faList } from '@fortawesome/free-solid-svg-icons/faList';
	import { faUserPlus } from '@fortawesome/free-solid-svg-icons/faUserPlus';
	import { superForm } from 'sveltekit-superforms';
	import Box from '$lib/components/Box.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import SubmitButton from '$lib/components/button/SubmitButton.svelte';
	import { NEUTRAL_ACTION_COLORS } from '$lib/ui/ui.constants';

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
				<SubmitButton icon={search} text="Buscar" colorClasses={NEUTRAL_ACTION_COLORS}
				></SubmitButton>

				<Button
					link="/customers/list"
					icon={faList}
					text="Ver listado"
					colorClasses="bg-indigo-500 hover:bg-indigo-600 focus:ring-blue-500"
				></Button>

				<Button
					link="/customers/new"
					icon={faUserPlus}
					text="Crear cliente"
					colorClasses={NEUTRAL_ACTION_COLORS}
				></Button>
			</div>
		</form>
	{/if}
</Box>

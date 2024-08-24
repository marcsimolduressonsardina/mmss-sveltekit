<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { faEdit } from '@fortawesome/free-solid-svg-icons/faEdit';
	import Box from '$lib/components/Box.svelte';
	import SubmitButton from '$lib/components/button/SubmitButton.svelte';
	import { NEUTRAL_ACTION_COLORS } from '$lib/ui/ui.constants';

	export let data;
	export let title = 'Crear Cliente';
	export let buttonText = 'Crear';
	const { form, errors, enhance, submitting } = superForm(data.form);
</script>

<Box {title}>
	<div>
		{#if $submitting}
			<ProgressBar />
		{:else}
			<form use:enhance class="space-y-4" method="post">
				<div>
					<label class="block text-sm font-medium text-gray-700" for="name">Nombre:</label>
					<input
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
						id="name"
						class:input-error={$errors.name}
						type="text"
						name="name"
						bind:value={$form.name}
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700" for="phone">Teléfono:</label>
					<input
						class="input-error mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
						class:input-error={$errors.phone}
						id="phone"
						type="tel"
						name="phone"
						bind:value={$form.phone}
					/>
				</div>

				<SubmitButton
					icon={faEdit}
					text={buttonText}
					colorClasses={NEUTRAL_ACTION_COLORS}
				></SubmitButton>
			</form>
		{/if}
	</div>
</Box>

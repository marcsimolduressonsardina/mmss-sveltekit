<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { Icon } from 'svelte-awesome';
	import { superForm } from 'sveltekit-superforms';
	import { faEdit } from '@fortawesome/free-solid-svg-icons/faEdit';

	export let data;
	export let title = 'Crear Cliente';
	export let buttonText = 'Crear';
	const { form, errors, enhance, submitting } = superForm(data.form);
</script>

<div class="space-y-4 rounded-lg bg-white p-4 shadow-md">
	<div class="text-xl font-semibold text-gray-900">{title}</div>

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

				<button
					class="w-full rounded-md bg-yellow-500 px-4 py-2 font-semibold text-white shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
					type="submit"
				>
					<Icon class="mr-2" data={faEdit} />
					{buttonText}
				</button>
			</form>
		{/if}
	</div>
</div>

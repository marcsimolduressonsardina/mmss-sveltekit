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

<div class="px-2 pt-1 text-xl font-semibold">{title}</div>
<div class="flex w-full flex-col place-content-center px-2">
	{#if $submitting}
		<ProgressBar />
	{:else}
		<form use:enhance class="w-full space-y-2" method="post">
			<label class="label" for="name">
				<span>Nombre:</span>
				<input
					class="input {$errors.name ? 'input-error' : ''}"
					id="name"
					type="text"
					name="name"
					bind:value={$form.name}
				/>
			</label>
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
				><Icon class="mr-2" data={faEdit} /> {buttonText}</button
			>
		</form>
	{/if}
</div>

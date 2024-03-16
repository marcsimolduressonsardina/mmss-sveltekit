<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { Icon } from 'svelte-awesome';
	import plus from 'svelte-awesome/icons/plus';
	import { superForm } from 'sveltekit-superforms';

	export let data;
	const { form, errors, constraints, enhance, submitting } = superForm(data.form);
</script>

<div class="px-2 pt-1 text-xl font-semibold">Crear Cliente</div>
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
				><Icon class="mr-2" data={plus} /> Crear</button
			>
		</form>
	{/if}
</div>

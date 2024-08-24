<script lang="ts">
	import type { PageData } from './$types';
	import { Icon } from 'svelte-awesome';
	import { faClipboardList } from '@fortawesome/free-solid-svg-icons/faClipboardList';
	import { faEdit } from '@fortawesome/free-solid-svg-icons/faEdit';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { dateProxy, superForm } from 'sveltekit-superforms';

	export let data: PageData;
	const { form, errors, enhance, submitting } = superForm(data.form);
	const proxyDate = dateProxy(form, 'deliveryDate', { format: 'date' });
</script>

<div class="pb-2">
	<aside class="alert variant-filled-secondary">
		<!-- Icon -->
		<div><Icon scale={3} data={faClipboardList} /></div>
		<!-- Message -->
		<div class="alert-message">
			<h3 class="h3">Convertir presupuesto en pedido</h3>
			<p>
				Rellene la fecha de entrega para el pedido. Esta acción no se puede deshacer. El nuevo
				pedido conservará todos los elementos, precios y fotos del presupuesto.
			</p>
		</div>
	</aside>
</div>

<div class="flex w-full flex-col place-content-center px-2">
	{#if $submitting}
		<ProgressBar />
	{:else}
		<form use:enhance class="w-full space-y-2" method="post">
			<label class="label" for="deliveryDate">
				<span>Fecha de entrega:</span>
				<input
					class="input {$errors.deliveryDate ? 'input-error' : ''}"
					name="deliveryDate"
					type="date"
					bind:value={$proxyDate}
				/>
			</label>
			<button class="variant-filled-warning btn w-full" type="submit"
				><Icon class="mr-2" data={faEdit} /> Convertir en pedido</button
			>
		</form>
	{/if}
</div>

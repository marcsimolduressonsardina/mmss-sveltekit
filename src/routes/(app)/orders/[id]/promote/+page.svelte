<script lang="ts">
	import type { PageData } from './$types';
	import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons/faClockRotateLeft';
	import { faEdit } from '@fortawesome/free-solid-svg-icons/faEdit';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { dateProxy, superForm } from 'sveltekit-superforms';
	import { ACCIONES_NEUTRES_COLORS } from '$lib/ui/ui.constants';
	import SubmitButton from '$lib/components/button/SubmitButton.svelte';
	import Banner from '$lib/components/Banner.svelte';
	import { getStatusUIInfo } from '$lib/ui/ui.helper';
	import { OrderStatus } from '@marcsimolduressonsardina/core';

	export let data: PageData;
	const { form, errors, enhance, submitting } = superForm(data.form);
	const proxyDate = dateProxy(form, 'deliveryDate', { format: 'date' });
</script>

<div class="space-y-4 p-4">
	<Banner
		icon={faClockRotateLeft}
		gradientClasses={getStatusUIInfo(OrderStatus.PENDING).gradientClasses}
		title="Convertir presupuesto en pedido"
		text="Rellene la fecha de entrega para el pedido. Esta acción no se puede deshacer. El nuevo
					pedido conservará todos los elementos, precios y fotos del presupuesto."
	></Banner>

	<div class="rounded-lg bg-white p-4 shadow-md">
		{#if $submitting}
			<ProgressBar text={'Convirtiendo...'} />
		{:else}
			<form use:enhance class="space-y-4" method="post">
				<div>
					<label class="block text-sm font-medium text-gray-700" for="deliveryDate"
						>Fecha de entrega:</label
					>
					<input
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						name="deliveryDate"
						type="date"
						bind:value={$proxyDate}
						class:input-error={$errors.deliveryDate}
					/>
				</div>
				<SubmitButton
					text="Convertir en pedido"
					icon={faEdit}
					colorClasses={ACCIONES_NEUTRES_COLORS}
				></SubmitButton>
			</form>
		{/if}
	</div>
</div>

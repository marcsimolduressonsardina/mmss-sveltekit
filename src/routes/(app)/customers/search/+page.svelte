<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import search from 'svelte-awesome/icons/search';
	import { faUserPlus } from '@fortawesome/free-solid-svg-icons/faUserPlus';
	import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';
	import { superForm } from 'sveltekit-superforms';
	import Box from '$lib/components/Box.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import SubmitButton from '$lib/components/button/SubmitButton.svelte';
	import {
		ACCIONES_NEUTRES_COLORS,
		BUSCAR_CLIENTE_COLORS,
		LISTADO_PEDIDOS_COLORS
	} from '$lib/ui/ui.constants';

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
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
					class:input-error={$errors.phone}
					id="phone"
					type="tel"
					name="phone"
					bind:value={$form.phone}
				/>
			</div>

			<div class="flex flex-col space-y-3 md:flex-row md:space-x-3 md:space-y-0">
				<SubmitButton icon={search} text="Buscar" colorClasses={BUSCAR_CLIENTE_COLORS}
				></SubmitButton>

				<Button
					link="/customers/list"
					icon={faUser}
					text="Ver listado"
					colorClasses={LISTADO_PEDIDOS_COLORS}
				></Button>

				<Button
					link="/customers/new"
					icon={faUserPlus}
					text="Crear cliente"
					colorClasses={ACCIONES_NEUTRES_COLORS}
				></Button>
			</div>
		</form>
	{/if}
</Box>

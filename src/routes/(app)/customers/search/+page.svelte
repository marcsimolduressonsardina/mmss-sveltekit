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
	import ClickButton from '$lib/components/button/ClickButton.svelte';
	import { goto } from '$app/navigation';
	export let data;
	const { form, errors, enhance, submitting } = superForm(data.form);

	let searchQuery = '';

	function triggerSearch() {
		goto(`/customers/search-list?query=${btoa(searchQuery)}`);
	}
</script>

<div class="space-y-4">
	<Box title={'Buscar cliente por teléfono'}>
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
				</div>
			</form>
		{/if}
	</Box>

	<!-- <Box title={'Buscar cliente por nombre'}>
		<div class="space-y-3">
			<div>
				<label class="block text-sm font-medium text-gray-700" for="phone">Nombre:</label>
				<input
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
					id="name"
					required
					type="text"
					name="name"
					bind:value={searchQuery}
				/>
			</div>

			<div class="flex flex-col space-y-3 md:flex-row md:space-x-3 md:space-y-0">
				<ClickButton
					disabled={searchQuery.length === 0}
					icon={search}
					text="Buscar"
					colorClasses={BUSCAR_CLIENTE_COLORS}
					onClick={() => {
						triggerSearch();
					}}
				></ClickButton>
			</div>
		</div>
	</Box> -->

	<Box title={'Gestión'}>
		<div class="flex flex-col space-y-3 md:flex-row md:space-x-3 md:space-y-0">
			{#if data.canSeeList}
				<Button
					textWhite={false}
					link="/customers/list"
					icon={faUser}
					text="Ver listado"
					colorClasses={LISTADO_PEDIDOS_COLORS}
				></Button>
			{/if}

			<Button
				link="/customers/new"
				icon={faUserPlus}
				text="Crear cliente"
				colorClasses={ACCIONES_NEUTRES_COLORS}
			></Button>
		</div>
	</Box>
</div>

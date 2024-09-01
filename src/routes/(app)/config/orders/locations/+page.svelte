<script lang="ts">
	import Box from '$lib/components/Box.svelte';
	import LocationItem from '$lib/components/config/LocationItem.svelte';
	import { Icon } from 'svelte-awesome';
	import type { PageData } from './$types';
	import trash from 'svelte-awesome/icons/trash';
	import plus from 'svelte-awesome/icons/plus';
	import { ACCIONES_NEUTRES_COLORS, ELIMINAR_COLORS } from '$lib/ui/ui.constants';
	import SubmitButton from '$lib/components/button/SubmitButton.svelte';
	import { faEdit } from '@fortawesome/free-solid-svg-icons/faEdit';

	export let data: PageData;
	let locations = data.locations;
	let newLocation = ''; // Bind this to the input field for adding a new location

	function addLocation() {
		if (newLocation.trim()) {
			locations = [...locations, newLocation.trim()].filter((l) => l !== ''); // Add the new location
			newLocation = ''; // Reset the input field
		}
	}

	function removeLocation(index: number) {
		locations = locations.filter((_, i) => i !== index); // Remove the selected location
	}
</script>

<Box title="Ubicaciones">
	<!-- Form to add a new location -->
	<div class="mt-4 space-y-4">
		<!-- Existing locations list -->
		{#each locations as location, index}
			<LocationItem text={location}>
				<button
					type="button"
					class={`flex transform items-center rounded-lg px-4 py-2 font-semibold text-white shadow-md  hover:shadow-lg ${ELIMINAR_COLORS}`}
					on:click={() => removeLocation(index)}
				>
					<Icon class="mr-2" data={trash} /> Eliminar
				</button>
			</LocationItem>
		{/each}
		<form on:submit|preventDefault={() => addLocation()} class="flex items-center">
			<input
				type="text"
				placeholder="Añadir nueva ubicación"
				bind:value={newLocation}
				class="mr-2 w-full rounded-lg border border-gray-300 p-2"
			/>
			<button
				type="submit"
				class={`flex transform items-center rounded-lg px-4 py-2 font-semibold text-white shadow-md hover:shadow-lg ${ACCIONES_NEUTRES_COLORS}`}
			>
				<Icon class="mr-2" data={plus} /> Añadir
			</button>
		</form>

		<!-- Form to submit locations -->
		<form method="post" action="?/saveLocations">
			<input type="hidden" name="locations" value={JSON.stringify(locations)} />
			<SubmitButton text="Guardar cambios" colorClasses={ACCIONES_NEUTRES_COLORS} icon={faEdit} />
		</form>
	</div>
</Box>

<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { faLocationDot } from '@fortawesome/free-solid-svg-icons/faLocationDot';
	import { faEdit } from '@fortawesome/free-solid-svg-icons/faEdit';
	import { ACCIONES_NEUTRES_COLORS } from '$lib/ui/ui.constants';
	import SubmitButton from '$lib/components/button/SubmitButton.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	const locations = data.locations;
	let selectedLocation = locations[0];
</script>

<div class="space-y-4 p-4">
	<div class="rounded-lg bg-gradient-to-r from-indigo-600 to-sky-600 p-6 text-white shadow-md">
		<div class="flex items-center space-x-4">
			<Icon scale={3} data={faLocationDot} />
			<div>
				<h3 class="text-xl font-bold">Ubicación para el pedido</h3>
				<p class="text-sm">Seleccione donde se ha dejado el pedido después de finalizarse</p>
			</div>
		</div>
	</div>

	<div class="rounded-lg bg-white p-4 shadow-md">
		<form method="post" action="?/saveLocation" class="space-y-4">
			<div>
				<label class="block text-sm font-medium text-gray-700" for="location">Ubicación:</label>
				<select
					id="location"
					name="location"
					bind:value={selectedLocation}
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				>
					{#each locations as location}
						<option value={location}>{location}</option>
					{/each}
				</select>
			</div>
			<SubmitButton text="Guardar ubicación" icon={faEdit} colorClasses={ACCIONES_NEUTRES_COLORS}
			></SubmitButton>
		</form>
	</div>
</div>

<script lang="ts">
	import type { PageData } from './$types';
	import { Icon } from 'svelte-awesome';
	import { faUserLarge } from '@fortawesome/free-solid-svg-icons/faUserLarge';
	import NewCustomer from '$lib/components/customer/NewCustomer.svelte';

	export let data: PageData;
</script>

<div class="space-y-4 p-4">
	<div class="rounded-lg bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white shadow-md">
		<div class="flex items-center space-x-4">
			<Icon scale={3} data={faUserLarge} />
			<div>
				<h3 class="text-xl font-bold">Vincular cliente al {data.orderName}</h3>
				<p class="text-sm">
					Rellene sólo el teléfono, si el cliente no existe, tendrá que poner su nombre.
				</p>
			</div>
		</div>
	</div>

	<NewCustomer {data} title={''} buttonText={'Vincular'} />
</div>

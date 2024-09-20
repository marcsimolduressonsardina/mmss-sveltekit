<script lang="ts">
	import type { PageData } from './$types';
	import { Icon } from 'svelte-awesome';
	import { faUserLarge } from '@fortawesome/free-solid-svg-icons/faUserLarge';
	import NewCustomer from '$lib/components/customer/NewCustomer.svelte';
	import OrderInfo from '$lib/components/order/OrderInfo.svelte';
	import OrderElements from '$lib/components/order/OrderElements.svelte';
	import ClickButton from '$lib/components/button/ClickButton.svelte';
	import search from 'svelte-awesome/icons/search';
	import { BUSCAR_CLIENTE_COLORS } from '$lib/ui/ui.constants';
	import Box from '$lib/components/Box.svelte';
	import { goto } from '$app/navigation';

	export let data: PageData;
	let searchQuery = '';

	function triggerSearch() {
		goto(`/customers/search-list?query=${btoa(searchQuery)}&linkOrderId=${data.order.id}`);
	}
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

	<Box title={'Buscar cliente por nombre'}>
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
	</Box>

	<OrderInfo order={data.order}></OrderInfo>

	<OrderElements order={data.order} calculatedItem={data.calculatedItem}></OrderElements>
</div>

<script lang="ts">
	import type { PageData } from './$types';
	import { faUserLarge } from '@fortawesome/free-solid-svg-icons/faUserLarge';
	import NewCustomer from '$lib/components/customer/NewCustomer.svelte';
	import OrderInfo from '$lib/components/order/OrderInfo.svelte';
	import OrderElements from '$lib/components/order/OrderElements.svelte';
	import ClickButton from '$lib/components/button/ClickButton.svelte';
	import search from 'svelte-awesome/icons/search';
	import { BUSCAR_CLIENTE_COLORS } from '$lib/ui/ui.constants';
	import Box from '$lib/components/Box.svelte';
	import { goto } from '$app/navigation';
	import Banner from '$lib/components/Banner.svelte';

	export let data: PageData;
	let searchQuery = '';

	function triggerSearch() {
		goto(`/customers/search-list?query=${btoa(searchQuery)}&linkOrderId=${data.order.id}`);
	}
</script>

<div class="space-y-4 p-4">
	<Banner
		icon={faUserLarge}
		gradientClasses="from-green-600 to-teal-600"
		title="Vincular cliente al {data.orderName}"
		text="Rellene sólo el teléfono, si el cliente no existe, tendrá que poner su nombre. También puede buscar por nombre."
	></Banner>

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

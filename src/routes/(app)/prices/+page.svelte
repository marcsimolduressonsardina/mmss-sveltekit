<script lang="ts">
	import { faList } from '@fortawesome/free-solid-svg-icons/faList';
	import { faMoneyBill } from '@fortawesome/free-solid-svg-icons/faMoneyBill';
	import { faCropSimple } from '@fortawesome/free-solid-svg-icons/faCropSimple';
	import Icon from 'svelte-awesome';
	import Box from '$lib/components/Box.svelte';
</script>

<Box title="Precios">
	<div
		class="flex w-full flex-col place-content-center items-center justify-center space-y-2 p-4 lg:flex-row lg:space-x-2 lg:space-y-0"
	>
		<a
			href="/prices/molds"
			class="w-full rounded-md bg-yellow-500 px-4 py-2 text-base font-semibold text-white shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
		>
			<Icon class="mr-2" data={faCropSimple} /> Cargar molduras
		</a>
		<a
			href="/prices/new"
			class="w-full rounded-md bg-gray-500 px-4 py-2 text-base font-semibold text-white shadow hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
		>
			<Icon class="mr-2" data={faMoneyBill} /> Nuevo precio
		</a>
		<a
			href="/prices/list"
			class="w-full rounded-md bg-blue-500 px-4 py-2 text-base font-semibold text-white shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
		>
			<Icon class="mr-2" data={faList} /> Lista de precios
		</a>
	</div>
</Box>

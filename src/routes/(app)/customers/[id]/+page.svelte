<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';
	import { faEdit } from '@fortawesome/free-solid-svg-icons/faEdit';
	import { faClipboardList } from '@fortawesome/free-solid-svg-icons/faClipboardList';
	import { faWhatsapp } from '@fortawesome/free-brands-svg-icons/faWhatsapp';
	import { faUserCircle } from '@fortawesome/free-solid-svg-icons/faUserCircle';
	import plus from 'svelte-awesome/icons/plus';

	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import Box from '$lib/components/Box.svelte';
	import type { PageData } from './$types';
	import { CustomerUtilites } from '$lib/shared/customer.utilities';

	export let data: PageData;
</script>

<Box title="Detalles del Cliente">
	{#await data.customer}
		<ProgressBar />
	{:then customer}
		{#if customer == null}
			<p class="text-center text-3xl">Cliente no encontrado</p>
			<div class="mt-4 flex justify-center">
				<a
					href="/customers/search"
					class="w-full rounded-md bg-blue-800 px-4 py-2 text-white shadow hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2"
				>
					Buscar cliente
				</a>
			</div>
		{:else}
			<div class="flex items-center space-x-4 rounded-md bg-slate-50 p-5 shadow-sm">
				<Icon class="text-gray-700" scale={2} data={faUserCircle} />
				<div>
					<p class="text-lg font-semibold text-gray-700">{customer.name}</p>
					<p class="text-sm text-gray-500">{customer.phone}</p>
				</div>
				<a
					class="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-white shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
					aria-label="Editar cliente"
					href="/customers/{customer.id}/edit"
				>
					<Icon data={faEdit} class="h-3 w-3" />
				</a>
			</div>

			<div class="mt-4 flex flex-col space-y-2 lg:flex-row lg:space-x-2 lg:space-y-0">
				<a
					class="w-full rounded-md bg-yellow-700 px-4 py-2 text-white shadow hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-800 focus:ring-offset-2"
					href="/customers/{customer.id}/orders/new"
				>
					<Icon class="mr-2" data={plus} /> Crear pedido
				</a>
				<a
					href="/customers/{customer.id}/orders"
					class="w-full rounded-md bg-blue-800 px-4 py-2 text-white shadow hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2"
				>
					<Icon class="mr-2" data={faBox} /> Ver pedidos
				</a>
				<a
					href="/customers/{customer.id}/quotes"
					class="w-full rounded-md bg-purple-800 px-4 py-2 text-white shadow hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-900 focus:ring-offset-2"
				>
					<Icon class="mr-2" data={faClipboardList} /> Ver presupuestos
				</a>
				<a
					href={CustomerUtilites.getWhatsappLink(customer)}
					target="_blank"
					class="w-full rounded-md bg-green-800 px-4 py-2 text-white shadow hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-900 focus:ring-offset-2"
				>
					<Icon class="mr-2" data={faWhatsapp} /> Enviar Whatsapp
				</a>
			</div>
		{/if}
	{/await}
</Box>

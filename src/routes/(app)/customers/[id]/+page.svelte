<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';
	import { faEdit } from '@fortawesome/free-solid-svg-icons/faEdit';
	import { faClipboardList } from '@fortawesome/free-solid-svg-icons/faClipboardList';
	import { faFileCirclePlus } from '@fortawesome/free-solid-svg-icons/faFileCirclePlus';
	import { faUserCircle } from '@fortawesome/free-solid-svg-icons/faUserCircle';

	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import Box from '$lib/components/Box.svelte';
	import type { PageData } from './$types';
	import WhatsAppButton from '$lib/components/button/WhatsAppButton.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import { FORMULARIO_COLORS, PEDIDOS_COLORS, PRESUPUESTOS_COLORS } from '$lib/ui/ui.constants';

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
				<Button
					icon={faFileCirclePlus}
					link="/customers/{customer.id}/orders/new"
					text="Crear nota"
					colorClasses={FORMULARIO_COLORS}
				></Button>

				<Button
					icon={faBox}
					link="/customers/{customer.id}/orders"
					text="Ver pedidos"
					colorClasses={PEDIDOS_COLORS}
				></Button>

				<Button
					icon={faClipboardList}
					link="/customers/{customer.id}/quotes"
					text="Ver presupuestos"
					colorClasses={PRESUPUESTOS_COLORS}
				></Button>

				<WhatsAppButton label="Enviar Whatsapp" message="" {customer}></WhatsAppButton>
			</div>
		{/if}
	{/await}
</Box>

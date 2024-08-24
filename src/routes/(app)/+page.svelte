<script lang="ts">
	import { faQrcode } from '@fortawesome/free-solid-svg-icons/faQrcode';
	import { faImage } from '@fortawesome/free-solid-svg-icons/faImage';
	import { faList } from '@fortawesome/free-solid-svg-icons/faList';
	import { faClipboardList } from '@fortawesome/free-solid-svg-icons/faClipboardList';
	import Icon from 'svelte-awesome';
	import plus from 'svelte-awesome/icons/plus';
	import search from 'svelte-awesome/icons/search';
</script>

<div
	class="flex w-full flex-col place-content-center items-center justify-center gap-4 p-6 md:grid md:grid-cols-2 lg:grid-cols-3"
>
	<a
		href="/orders/new"
		class="w-full rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400"
	>
		<Icon class="mr-2" data={faImage} /> Crear presupuesto
	</a>

	<a
		href="/customers/new"
		class="w-full rounded-lg bg-yellow-600 px-6 py-4 text-lg font-semibold text-white shadow-lg hover:bg-yellow-700 focus:outline-none focus:ring-4 focus:ring-yellow-400"
	>
		<Icon class="mr-2" data={plus} /> Crear cliente
	</a>

	<a
		href="/customers/search"
		class="w-full rounded-lg bg-gray-600 px-6 py-4 text-lg font-semibold text-white shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-400"
	>
		<Icon class="mr-2" data={search} /> Buscar cliente
	</a>

	<a
		href="/orders/scan"
		class="w-full rounded-lg bg-green-600 px-6 py-4 text-lg font-semibold text-white shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-400"
	>
		<Icon class="mr-2" data={faQrcode} /> Escanear / Buscar
	</a>

	<a
		href="/orders/list"
		class="w-full rounded-lg bg-purple-600 px-6 py-4 text-lg font-semibold text-white shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-400"
	>
		<Icon class="mr-2" data={faList} /> Listado de pedidos
	</a>

	<a
		href="/orders/list?status=quote"
		class="w-full rounded-lg bg-indigo-600 px-6 py-4 text-lg font-semibold text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-400"
	>
		<Icon class="mr-2" data={faClipboardList} /> Listado de presupuestos
	</a>
</div>

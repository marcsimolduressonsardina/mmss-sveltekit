<script lang="ts">
	import { faQrcode } from '@fortawesome/free-solid-svg-icons/faQrcode';
	import { faFileCirclePlus } from '@fortawesome/free-solid-svg-icons/faFileCirclePlus';
	import { faList } from '@fortawesome/free-solid-svg-icons/faList';
	import { faClipboardList } from '@fortawesome/free-solid-svg-icons/faClipboardList';
	import search from 'svelte-awesome/icons/search';
	import HomeButton from '$lib/components/button/HomeButton.svelte';
	import { NEUTRAL_ACTION_COLORS } from '$lib/ui/ui.constants';
</script>

<div
	class="flex w-full flex-col place-content-center items-center justify-center gap-4 p-6 md:grid md:grid-cols-2 lg:grid-cols-3"
>
	<HomeButton
		icon={faFileCirclePlus}
		text="Formulario"
		link={'/orders/new'}
		colorClasses="bg-fuchsia-600 hover:bg-fuchsia-700 focus:bg-fuchsia-400"
	></HomeButton>

	<HomeButton
		icon={search}
		text="Buscar cliente"
		link="/customers/search"
		colorClasses={NEUTRAL_ACTION_COLORS}
	></HomeButton>

	<HomeButton
		icon={faQrcode}
		text="Escanear resguardo"
		link="/orders/scan"
		colorClasses="bg-neutral-800 hover:bg-neutral-950 focus:bg-neutral-700"
	></HomeButton>

	<HomeButton
		icon={faList}
		text="Listado pedidos"
		link="/orders/list"
		colorClasses="bg-yellow-500 hover:bg-yellow-600 focus:bg-yellow-400"
	></HomeButton>

	<HomeButton
		icon={faClipboardList}
		text="Listado de presupuestos"
		link="/orders/list?status=quote"
		colorClasses="bg-purple-600 hover:bg-purple-700 focus:bg-purple-500"
	></HomeButton>
</div>

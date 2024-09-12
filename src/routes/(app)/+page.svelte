<script lang="ts">
	import { faQrcode } from '@fortawesome/free-solid-svg-icons/faQrcode';
	import { faFileCirclePlus } from '@fortawesome/free-solid-svg-icons/faFileCirclePlus';
	import { faList } from '@fortawesome/free-solid-svg-icons/faList';
	import { faClipboardList } from '@fortawesome/free-solid-svg-icons/faClipboardList';
	import search from 'svelte-awesome/icons/search';
	import {
		BUSCAR_CLIENTE_COLORS,
		ESCANEAR_RESGUARDO_COLORS,
		FORMULARIO_COLORS,
		LISTADO_PEDIDOS_COLORS,
		PRESUPUESTOS_COLORS
	} from '$lib/ui/ui.constants';
	import Button from '$lib/components/button/Button.svelte';
</script>

<div
	class="flex w-full flex-col place-content-center items-center justify-center gap-4 p-6 md:grid md:grid-cols-2 lg:grid-cols-3"
>
	<Button
		icon={search}
		homeButton={true}
		text="Buscar cliente"
		link="/customers/search"
		colorClasses={BUSCAR_CLIENTE_COLORS}
	></Button>

	<Button
		textWhite={false}
		homeButton={true}
		icon={faList}
		text="Listado pedidos"
		link="/orders/list"
		colorClasses={LISTADO_PEDIDOS_COLORS}
	></Button>

	<Button
		homeButton={true}
		icon={faClipboardList}
		text="Listado de presupuestos"
		link="/orders/list?status=quote"
		colorClasses={PRESUPUESTOS_COLORS}
	></Button>

	<Button
		homeButton={true}
		icon={faQrcode}
		text="Escanear resguardo"
		link="/orders/scan"
		colorClasses={ESCANEAR_RESGUARDO_COLORS}
	></Button>

	<Button
		homeButton={true}
		icon={faFileCirclePlus}
		text="Crear nota"
		link={'/orders/new'}
		colorClasses={FORMULARIO_COLORS}
	></Button>
</div>

<script lang="ts">
	import { faList } from '@fortawesome/free-solid-svg-icons/faList';
	import { faMoneyBill } from '@fortawesome/free-solid-svg-icons/faMoneyBill';
	import { faCropSimple } from '@fortawesome/free-solid-svg-icons/faCropSimple';
	import { faLocationDot } from '@fortawesome/free-solid-svg-icons/faLocationDot';
	import Box from '$lib/components/Box.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import {
		ACCIONES_NEUTRES_COLORS,
		FORMULARIO_COLORS,
		LISTADO_PEDIDOS_COLORS
	} from '$lib/ui/ui.constants';
</script>

<div class="space-y-4">
	<h2 class="mb-4 text-2xl font-semibold text-gray-800">Configuración de la aplicación</h2>

	<Box title="Precios">
		<div
			class="flex w-full flex-col place-content-center items-center justify-center gap-4 p-2 md:grid md:grid-cols-2 lg:grid-cols-3"
		>
			<Button
				link="/config/prices/molds"
				text="Cargar molduras"
				icon={faCropSimple}
				colorClasses={ACCIONES_NEUTRES_COLORS}
			></Button>

			<Button
				link="/config/prices/new"
				text="Nuevo precio"
				icon={faMoneyBill}
				colorClasses={FORMULARIO_COLORS}
			></Button>

			<Button
				link="/config/prices/list"
				text="Lista de precios"
				textWhite={false}
				icon={faList}
				colorClasses={LISTADO_PEDIDOS_COLORS}
			></Button>
		</div>
	</Box>

	<!-- <Box title="Pedidos">
		<div
			class="flex w-full flex-col place-content-center items-center justify-center gap-4 p-2 md:grid md:grid-cols-2 lg:grid-cols-3"
		>
			<Button
				link="/config/orders/locations"
				text="Editar ubicaciones"
				icon={faLocationDot}
				colorClasses={ACCIONES_NEUTRES_COLORS}
			></Button>
		</div>
	</Box> -->
</div>

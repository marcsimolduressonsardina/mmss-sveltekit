<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { faClipboardList } from '@fortawesome/free-solid-svg-icons/faClipboardList';
	import { faEdit } from '@fortawesome/free-solid-svg-icons/faEdit';
	import { ACCIONES_NEUTRES_COLORS } from '$lib/ui/ui.constants';
	import SubmitButton from '$lib/components/button/SubmitButton.svelte';
	import { enhance } from '$app/forms';
</script>

<div class="space-y-4 p-4">
	<div class="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white shadow-md">
		<div class="flex items-center space-x-4">
			<Icon scale={3} data={faClipboardList} />
			<div>
				<h3 class="text-xl font-bold">Convertir pedido en presupuesto</h3>
				<p class="text-sm">
					Esta acción no se puede deshacer. El nuevo presupuesto conservará todos los elementos,
					precios y fotos del pedido. Se eliminarán pagos a cuenta y fecha de entrega.
				</p>
			</div>
		</div>
	</div>

	<div class="rounded-lg bg-white p-4 shadow-md">
		<form use:enhance class="space-y-4" method="post">
			<SubmitButton
				text="Convertir en presupuesto"
				icon={faEdit}
				colorClasses={ACCIONES_NEUTRES_COLORS}
			></SubmitButton>
		</form>
	</div>
</div>

<script lang="ts">
	import { faClipboardList } from '@fortawesome/free-solid-svg-icons/faClipboardList';
	import { faEdit } from '@fortawesome/free-solid-svg-icons/faEdit';
	import { ACCIONES_NEUTRES_COLORS } from '$lib/ui/ui.constants';
	import SubmitButton from '$lib/components/button/SubmitButton.svelte';
	import { enhance } from '$app/forms';
	import Banner from '$lib/components/Banner.svelte';
	import { getStatusUIInfo } from '$lib/ui/ui.helper';
	import { OrderStatus } from '@marcsimolduressonsardina/core';
</script>

<div class="space-y-4 p-4">
	<Banner
		icon={faClipboardList}
		gradientClasses={getStatusUIInfo(OrderStatus.QUOTE).gradientClasses}
		title="Convertir pedido en presupuesto"
		text="Esta acción no se puede deshacer. El nuevo presupuesto conservará todos los elementos,
					precios y fotos del pedido. Se eliminarán pagos a cuenta y fecha de entrega."
	></Banner>

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

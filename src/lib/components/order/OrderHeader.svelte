<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import {
		faCheckCircle,
		faCircleXmark,
		faClock,
		faUserLarge,
		faLocationDot
	} from '@fortawesome/free-solid-svg-icons';
	import { DateTime } from 'luxon';
	import { OrderStatus } from '$lib/type/order.type';
	import { orderStatusMap, OrderUtilites, tempCustomerUuid } from '$lib/shared/order.utilities';
	import type { CalculatedItem, Order } from '$lib/type/api.type';
	import { CalculatedItemUtilities } from '$lib/shared/calculated-item.utilites';
	import Button from '../button/Button.svelte';
	import {
		ACCIONES_NEUTRES_COLORS,
		ACCIONES_VER_COLORS,
		ELIMINAR_COLORS,
		LISTADO_FINALIZADOS
	} from '$lib/ui/ui.constants';
	import { getStatusUIInfo, getStatusUIInfoWithPaymentInfo } from '$lib/ui/ui.helper';

	export let order: Order;
	export let calculatedItem: CalculatedItem;
	const totalOrder = CalculatedItemUtilities.getTotal(calculatedItem);
	const payed = order.amountPayed === totalOrder;
</script>

<div class={`overflow-hidden rounded-lg shadow-md`}>
	<!-- Header with Gradient Background -->
	<div
		class={`bg-gradient-to-r ${getStatusUIInfoWithPaymentInfo(order.status, payed).gradientClasses} flex justify-between p-3 text-white`}
	>
		<h3 class="flex items-center text-lg font-semibold">
			<Icon data={getStatusUIInfo(order.status).statusIcon} class="mr-2" />
			{order.status === OrderStatus.QUOTE ? 'Presupuesto' : 'Pedido'}
		</h3>
		<div class="overflow-hidden overflow-ellipsis whitespace-nowrap text-[0.6rem]">
			<span class="rounded-lg bg-white px-2 py-1 font-mono text-gray-800">
				{OrderUtilites.getOrderPublicId(order)}
			</span>
		</div>
	</div>

	<!-- Order Details -->
	<div class="space-y-1 rounded-lg bg-white px-2 py-4 shadow-md">
		<!-- Customer Name -->
		{#if order.customer.id !== tempCustomerUuid}
			<Button
				colorClasses={ACCIONES_VER_COLORS}
				text={order.customer.name}
				icon={faUserLarge}
				link={`/customers/${order.customer.id}`}
			></Button>
		{/if}

		<!-- Payment Status -->
		{#if order.status !== OrderStatus.QUOTE}
			{#if order.amountPayed === 0}
				<Button
					colorClasses={ELIMINAR_COLORS}
					text="Pendiente de pago"
					icon={faCircleXmark}
					link={`/orders/${order.id}/payments`}
				></Button>
			{:else if order.amountPayed === totalOrder}
				<Button
					colorClasses={LISTADO_FINALIZADOS}
					text="Pagado"
					icon={faCheckCircle}
					link={`/orders/${order.id}/payments`}
				></Button>
			{:else}
				<Button
					colorClasses={ELIMINAR_COLORS}
					text="Parcialmente pagado"
					icon={faCircleXmark}
					link={`/orders/${order.id}/payments`}
				></Button>
			{/if}

			<!-- Current Status -->

			<Button
				colorClasses={getStatusUIInfoWithPaymentInfo(order.status, payed).colors}
				text="Estado: {orderStatusMap[order.status]}"
				icon={getStatusUIInfo(order.status).statusIcon}
				link={`/orders/${order.id}/status`}
			></Button>

			{#if order.status === OrderStatus.FINISHED}
				<Button
					colorClasses={ACCIONES_NEUTRES_COLORS}
					text="Ubicación: {order.location.length === 0 ? 'Sin ubicación' : order.location}"
					icon={faLocationDot}
					link={`/orders/${order.id}/location`}
				></Button>
			{/if}
		{/if}

		<!-- Total Amount and Date Section -->
		<div class="flex items-end justify-between px-2 pt-1">
			<!-- Total Amount -->
			{#if order.amountPayed > 0 && order.amountPayed !== totalOrder}
				<div class="flex flex-col">
					<div class="flex items-center text-lg text-gray-800 line-through">
						<span>{totalOrder.toFixed(2)} €</span>
					</div>
					<div class="flex items-center text-lg text-gray-800">
						<span>{order.amountPayed.toFixed(2)} € pagado</span>
					</div>
					<div class="flex items-center text-xl font-bold text-gray-800">
						<span>{(totalOrder - order.amountPayed).toFixed(2)} € pendiente</span>
					</div>
				</div>
			{:else}
				<div class="flex items-center text-xl font-bold text-gray-800">
					<span>{totalOrder.toFixed(2)} €</span>
				</div>
			{/if}

			<!-- Date Created -->
			<div class="flex items-center text-xs text-gray-700">
				<Icon class="mr-2" data={faClock} />
				<span>{DateTime.fromJSDate(order.createdAt).toFormat('dd/MM/yyyy')}</span>
			</div>
		</div>
	</div>
</div>

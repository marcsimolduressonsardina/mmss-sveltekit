<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import {
		faCheckCircle,
		faTimesCircle,
		faTruck,
		faCircleXmark,
		faClockRotateLeft,
		faClipboardList,
		faClock,
		faUserLarge
	} from '@fortawesome/free-solid-svg-icons';
	import { DateTime } from 'luxon';
	import { OrderStatus } from '$lib/type/order.type';
	import { orderStatusMap, OrderUtilites, tempCustomerUuid } from '$lib/shared/order.utilities';
	import type { CalculatedItem, Order } from '$lib/type/api.type';
	import { CalculatedItemUtilities } from '$lib/shared/calculated-item.utilites';
	import Button from '../button/Button.svelte';
	import { ACCIONES_VER_COLORS, ELIMINAR_COLORS, LISTADO_FINALIZADOS } from '$lib/ui/ui.constants';
	import { getStatusUIInfo } from '$lib/ui/ui.helper';

	export let order: Order;
	export let calculatedItem: CalculatedItem;
	const totalOrder = CalculatedItemUtilities.getTotal(calculatedItem);

	// Determine gradient based on order status
	let gradientClasses = '';
	let colorClasses = '';
	let statusIcon = faTruck;
	switch (order.status) {
		case OrderStatus.PENDING:
			colorClasses = 'text-orange-600';
			gradientClasses = 'from-orange-600 via-orange-500 to-orange-400';
			statusIcon = faClockRotateLeft;
			break;
		case OrderStatus.FINISHED:
			colorClasses = 'text-green-600';
			gradientClasses = 'from-green-800 via-green-700 to-green-600';
			statusIcon = faCheckCircle;
			break;
		case OrderStatus.PICKED_UP:
			colorClasses = 'text-blue-600';
			gradientClasses = 'from-blue-800 via-blue-700 to-blue-600';
			statusIcon = faTruck;
			break;
		case OrderStatus.DELETED:
			gradientClasses = 'from-red-800 via-red-700 to-red-600';
			statusIcon = faTimesCircle;
			break;
		case OrderStatus.QUOTE:
			gradientClasses = 'from-purple-800 via-purple-700 to-purple-600';
			statusIcon = faClipboardList;
			break;
	}
</script>

<div class={`overflow-hidden rounded-lg shadow-md`}>
	<!-- Header with Gradient Background -->
	<div class={`bg-gradient-to-r ${gradientClasses} flex justify-between p-3 text-white`}>
		<h3 class="flex items-center text-lg font-semibold">
			<Icon data={statusIcon} class="mr-2" />
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
				colorClasses={getStatusUIInfo(order.status).colors}
				text="Estado: {orderStatusMap[order.status]}"
				icon={getStatusUIInfo(order.status).statusIcon}
				link={`/orders/${order.id}/status`}
			></Button>

			<!-- {#if order.status === OrderStatus.FINISHED}
				<div class="text-md flex items-center text-gray-700">
					<Icon class="mr-2" data={faLocationDot} />
					<span>
						Ubicación: {order.location.length === 0 ? 'Sin ubicación' : order.location}
					</span>
				</div>
			{/if} -->
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

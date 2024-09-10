<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import {
		faCheckCircle,
		faCreditCard,
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

	export let order: Order;
	export let calculatedItem: CalculatedItem;
	const totalOrder = CalculatedItemUtilities.getTotal(calculatedItem);

	// Determine gradient based on order status
	let gradientClasses = '';
	let colorClasses = '';
	let statusIcon = faTruck;
	switch (order.status) {
		case OrderStatus.PENDING:
			colorClasses = 'bg-orange-600';
			gradientClasses = 'from-orange-600 via-orange-500 to-orange-400';
			statusIcon = faClockRotateLeft;
			break;
		case OrderStatus.FINISHED:
			colorClasses = 'bg-green-600';
			gradientClasses = 'from-green-800 via-green-700 to-green-600';
			statusIcon = faCheckCircle;
			break;
		case OrderStatus.PICKED_UP:
			colorClasses = 'bg-blue-600';
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
	<div class="space-y-3 rounded-lg bg-white p-4 shadow-md">
		<!-- Customer Name -->
		<div class="flex items-center rounded-md bg-blue-600 px-3 py-1 text-lg text-white">
			<Icon class="mr-2 " data={faUserLarge} />
			<span>{order.customer.name}</span>
		</div>

		<!-- Payment Status -->
		{#if order.status !== OrderStatus.QUOTE}
			{#if order.amountPayed === 0}
				<div class="flex items-center rounded-md bg-red-600 px-3 py-1 text-lg text-white">
					<Icon class="mr-2 " data={faCircleXmark} />
					<span>No pagado</span>
				</div>
			{:else if order.amountPayed === totalOrder}
				<div class="flex items-center rounded-md bg-green-600 px-3 py-1 text-lg text-white">
					<Icon class="mr-2 " data={faCheckCircle} />
					<span>Pagado</span>
				</div>
			{:else}
				<div class="flex items-center rounded-md bg-red-600 px-3 py-1 text-lg text-white">
					<Icon class="mr-2 " data={faCircleXmark} />
					<span>No pagado totalmente</span>
				</div>
			{/if}

			<!-- Current Status -->
			<div class={`${colorClasses} flex items-center rounded-md  px-3 py-1 text-lg text-white`}>
				<Icon class="mr-2 " data={statusIcon} />
				<span>Estado: {orderStatusMap[order.status]}</span>
			</div>

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
		<div class="flex items-center justify-between px-2 pt-2">
			<!-- Total Amount -->
			{#if order.amountPayed > 0 && order.amountPayed !== totalOrder}
				<div class="flex flex-col">
					<div class="flex items-center text-lg text-gray-800 line-through">
						<Icon class="mr-2" data={faCreditCard} />
						<span>{totalOrder.toFixed(2)} €</span>
					</div>
					<div class="text-md flex items-center text-gray-800">
						<span>{order.amountPayed.toFixed(2)} € pagado</span>
					</div>
					<div class="text-md flex items-center text-gray-800">
						<span>{(totalOrder - order.amountPayed).toFixed(2)} € pendiente</span>
					</div>
				</div>
			{:else}
				<div class="flex items-center text-lg text-gray-800">
					<Icon class="mr-2" data={faCreditCard} />
					<span>{totalOrder.toFixed(2)} €</span>
				</div>
			{/if}

			<!-- Date Created -->
			<div class="flex items-center text-lg text-gray-700">
				<Icon class="mr-2" data={faClock} />
				<span>{DateTime.fromJSDate(order.createdAt).toFormat('dd/MM/yyyy')}</span>
			</div>
		</div>
	</div>
</div>

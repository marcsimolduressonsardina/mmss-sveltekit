<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { faUserLarge } from '@fortawesome/free-solid-svg-icons/faUserLarge';
	import { faClock } from '@fortawesome/free-solid-svg-icons/faClock';
	import { faSignHanging } from '@fortawesome/free-solid-svg-icons';
	import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';
	import { faCreditCard } from '@fortawesome/free-regular-svg-icons';
	import {
		faCheckCircle,
		faScaleUnbalanced,
		faTimesCircle,
		faLocationDot
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
	switch (order.status) {
		case OrderStatus.PENDING:
			gradientClasses = 'from-orange-600 via-orange-500 to-orange-400';
			break;
		case OrderStatus.FINISHED:
			gradientClasses = 'from-green-800 via-green-700 to-green-600';
			break;
		case OrderStatus.PICKED_UP:
			gradientClasses = 'from-blue-800 via-blue-700 to-blue-600';
			break;
		case OrderStatus.DELETED:
			gradientClasses = 'from-red-800 via-red-700 to-red-600';
			break;
		case OrderStatus.QUOTE:
			gradientClasses = 'from-purple-800 via-purple-700 to-purple-600';
			break;
	}
</script>

<div class={`overflow-hidden rounded-lg shadow-md`}>
	<!-- Header with Gradient Background -->
	<div class={`bg-gradient-to-r ${gradientClasses} flex justify-between p-3 text-white`}>
		<h3 class="text-lg font-semibold">
			<Icon data={faSignHanging} />
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
		{#if order.customer.id !== tempCustomerUuid}
			<div class="flex items-center text-lg text-gray-700">
				<Icon class="mr-2 " data={faUserLarge} />
				<span>{order.customer.name}</span>
			</div>
		{/if}

		<!-- Order Date -->
		<div class="text-md flex items-center text-gray-700">
			<Icon class="mr-2 text-gray-600" data={faClock} />
			<span>{DateTime.fromJSDate(order.createdAt).toFormat('dd/MM/yyyy HH:mm')}</span>
		</div>

		<!-- Total Amount -->
		<div class="text-md flex items-center text-gray-700">
			<Icon class="mr-2" data={faCreditCard} />
			<span>Total {totalOrder.toFixed(2)} €</span>
		</div>

		<!-- Payment Status -->
		{#if order.status !== OrderStatus.QUOTE}
			{#if order.amountPayed === 0}
				<div class="text-md flex items-center text-red-700">
					<Icon class="mr-2" data={faTimesCircle} />
					No pagado
				</div>
			{:else if order.amountPayed === totalOrder}
				<div class="text-md flex items-center text-green-700">
					<Icon class="mr-2" data={faCheckCircle} />
					Pagado
				</div>
			{:else}
				<div class="text-md flex items-center text-yellow-700">
					<Icon class="mr-2" data={faScaleUnbalanced} />
					{order.amountPayed.toFixed(2)}€ pagado | {(totalOrder - order.amountPayed).toFixed(2)}€
					pendiente de pago
				</div>
			{/if}

			<!-- Current Status -->
			<div class="text-md flex items-center text-gray-700">
				<Icon class="mr-2" data={faInfoCircle} />
				<span
					>Estado:
					{orderStatusMap[order.status]} -
					{DateTime.fromJSDate(order.statusUpdated).toFormat('dd/MM/yyyy HH:mm')}
				</span>
			</div>

			{#if order.status === OrderStatus.FINISHED}
				<div class="text-md flex items-center text-gray-700">
					<Icon class="mr-2" data={faLocationDot} />
					<span>
						Ubicación: {order.location.length === 0 ? 'Sin ubicación' : order.location}
					</span>
				</div>
			{/if}
		{/if}
	</div>
</div>

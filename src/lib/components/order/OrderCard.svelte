<script lang="ts">
	import { DateTime } from 'luxon';
	import { goto } from '$app/navigation';
	import type { Order } from '$lib/type/api.type';
	import { Icon } from 'svelte-awesome';
	import {
		faEye,
		faCheckCircle,
		faTruck,
		faClock,
		faClockRotateLeft,
		faChain,
		faUserLarge,
		faClipboardList
	} from '@fortawesome/free-solid-svg-icons';
	import { OrderUtilites, orderStatusMap, tempCustomerUuid } from '$lib/shared/order.utilities';
	import { OrderStatus } from '$lib/type/order.type';

	export let order: Order;
	export let showCustomer: boolean = true;
	let gradientClasses = '';
	let statusIcon = faUserLarge;
	switch (order.status) {
		case OrderStatus.PENDING:
			gradientClasses = 'from-orange-600 via-orange-500 to-orange-400';
			statusIcon = faClockRotateLeft;
			break;
		case OrderStatus.FINISHED:
			gradientClasses = 'from-green-800 via-green-700 to-green-600';
			statusIcon = faCheckCircle;
			break;
		case OrderStatus.PICKED_UP:
			gradientClasses = 'from-blue-800 via-blue-700 to-blue-600';
			statusIcon = faTruck;
			break;
		case OrderStatus.DELETED:
			gradientClasses = 'from-red-800 via-red-700 to-red-600';
			statusIcon = faClock;
			break;
		case OrderStatus.QUOTE:
			gradientClasses = 'from-purple-800 via-purple-700 to-purple-600';
			statusIcon = faClipboardList;
			break;
	}
</script>

<div class="mx-auto w-full overflow-hidden rounded-lg bg-white shadow-lg md:max-w-md">
	<!-- Header Section -->
	<div
		class="bg-gradient-to-r p-4 text-white"
		class:from-orange-600={OrderStatus.PENDING === order.status}
		class:via-orange-500={OrderStatus.PENDING === order.status}
		class:to-orange-400={OrderStatus.PENDING === order.status}
		class:from-green-800={OrderStatus.FINISHED === order.status}
		class:via-green-700={OrderStatus.FINISHED === order.status}
		class:to-green-600={OrderStatus.FINISHED === order.status}
		class:from-blue-800={OrderStatus.PICKED_UP === order.status}
		class:via-blue-700={OrderStatus.PICKED_UP === order.status}
		class:to-blue-600={OrderStatus.PICKED_UP === order.status}
		class:from-red-800={OrderStatus.DELETED === order.status}
		class:via-red-700={OrderStatus.DELETED === order.status}
		class:to-red-600={OrderStatus.DELETED === order.status}
		class:from-purple-800={OrderStatus.QUOTE === order.status}
		class:via-purple-700={OrderStatus.QUOTE === order.status}
		class:to-purple-600={OrderStatus.QUOTE === order.status}
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-1 pr-2 text-sm">
				<Icon data={statusIcon} />
				<span class="font-semibold">{orderStatusMap[order.status]}</span>
			</div>
			<div class="overflow-hidden overflow-ellipsis whitespace-nowrap text-[0.6rem]">
				<span class="rounded-lg bg-white px-2 py-1 font-mono text-gray-800">
					{OrderUtilites.getOrderPublicId(order)}
				</span>
			</div>
		</div>
	</div>

	<!-- Details Section -->
	<div class="space-y-3 p-4 text-sm">
		<div>
			<div class="flex items-center text-gray-600">
				<Icon class="mr-2 text-gray-500" data={faClock} />
				<span>Fecha:</span>
			</div>
			<div class="font-semibold">
				{DateTime.fromJSDate(order.item.createdAt).toFormat('dd/MM/yyyy HH:mm')}
			</div>
		</div>

		{#if showCustomer && order.customer.id !== tempCustomerUuid}
			<div>
				<div class="flex items-center text-gray-600">
					<Icon class="mr-2 text-gray-500" data={faUserLarge} />
					<span>Cliente:</span>
				</div>
				<div class="font-semibold">
					{order.customer.name}
				</div>
			</div>
		{/if}

		{#if order.customer.id === tempCustomerUuid}
			<div>
				<div class="flex items-center text-gray-600">
					<Icon class="mr-2 text-gray-500" data={faUserLarge} />
					<span>Cliente:</span>
				</div>
				<div
					class="font-semibold {order.status === OrderStatus.QUOTE
						? 'text-purple-600'
						: 'text-red-600'}"
				>
					{order.status === OrderStatus.QUOTE ? 'Presupuesto sin vincular' : 'Pedido sin vincular'}
				</div>
			</div>
		{/if}

		{#if order.status !== OrderStatus.QUOTE}
			<div>
				<div class="flex items-center text-gray-600">
					<Icon class="mr-2 text-gray-500" data={faTruck} />
					<span>Recogida:</span>
				</div>
				<div class="font-semibold">
					{DateTime.fromJSDate(order.item.deliveryDate).toFormat('dd/MM/yyyy')}
				</div>
			</div>
		{/if}

		<!-- {#if order.status === OrderStatus.FINISHED}
			<div>
				<div class="flex items-center text-gray-600">
					<Icon class="mr-2 text-gray-500" data={faLocationDot} />
					<span>Ubicación:</span>
				</div>
				<div class="font-semibold">
					{order.location.length === 0 ? 'Sin ubicación' : order.location}
				</div>
			</div>
		{/if} -->

		<div class="rounded-lg bg-gray-100 p-2 text-sm">
			{order.item.description}
		</div>
	</div>

	<!-- Footer Section -->
	<div class="flex justify-end bg-gray-50 p-3">
		<button
			class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow transition-all duration-200 hover:bg-blue-700"
			on:click={() => goto(`/orders/${order.id}`)}
		>
			{#if order.customer.id === tempCustomerUuid}
				<Icon class="mr-1" data={faChain} />
				{order.status === OrderStatus.QUOTE ? 'Vincular presupuesto' : 'Vincular pedido'}
			{:else if order.status === OrderStatus.QUOTE}
				<Icon class="mr-1" data={faEye} /> Ver presupuesto
			{:else}
				<Icon class="mr-1" data={faEye} /> Ver pedido
			{/if}
		</button>
	</div>
</div>

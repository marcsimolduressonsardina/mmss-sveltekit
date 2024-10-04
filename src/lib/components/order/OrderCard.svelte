<script lang="ts">
	import { DateTime } from 'luxon';
	import { goto } from '$app/navigation';
	import type { FullOrder } from '$lib/type/api.type';
	import { Icon } from 'svelte-awesome';
	import {
		faEye,
		faTruck,
		faClock,
		faChain,
		faUserLarge,
		faCoins,
		faLocationDot
	} from '@fortawesome/free-solid-svg-icons';
	import { OrderUtilites, orderStatusMap, tempCustomerUuid } from '$lib/shared/order.utilities';
	import { OrderStatus } from '$lib/type/order.type';
	import { CalculatedItemUtilities } from '$lib/shared/calculated-item.utilites';
	import { getStatusUIInfo, getStatusUIInfoWithPaymentInfo } from '$lib/ui/ui.helper';
	import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';

	export let fullOrder: FullOrder;
	export let showCustomer: boolean = true;
	const order = fullOrder.order;
	const calculatedItem = fullOrder.calculatedItem;
	const totalOrder = CalculatedItemUtilities.getTotal(calculatedItem);
	const payed = order.amountPayed === totalOrder;
</script>

<div class="mx-auto w-full overflow-hidden rounded-lg bg-white shadow-lg md:max-w-md">
	<div
		class={`bg-gradient-to-r p-4 text-white ${getStatusUIInfoWithPaymentInfo(order.status, payed).gradientClasses}`}
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-1 pr-2 text-sm">
				<Icon data={getStatusUIInfo(order.status).statusIcon} />
				<span class="font-semibold">{orderStatusMap[order.status]}</span>
			</div>
			<div class="overflow-hidden overflow-ellipsis whitespace-nowrap text-[0.6rem]">
				<span class="rounded-lg bg-white px-2 py-1 font-mono text-gray-800">
					{OrderUtilites.getOrderPublicId(order)}
				</span>
			</div>
		</div>
	</div>

	<div class="space-y-3 p-1 text-sm">
		<div class="flex flex-row justify-between">
			<div class="space-y-3 p-3 text-sm">
				<div>
					<div class="flex items-center text-gray-600">
						<Icon class="mr-2 text-gray-500" data={faClock} />
						<span>Fecha</span>
					</div>
					<div class="font-semibold">
						{DateTime.fromJSDate(order.createdAt).toFormat('dd/MM/yyyy HH:mm')}
					</div>
				</div>

				{#if showCustomer && order.customer.id !== tempCustomerUuid}
					<div>
						<div class="flex items-center text-gray-600">
							<Icon class="mr-2 text-gray-500" data={faUserLarge} />
							<span>Cliente</span>
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
						<div class="text-red-600' font-semibold">
							{order.status === OrderStatus.QUOTE
								? 'Presupuesto sin vincular'
								: 'Pedido sin vincular'}
						</div>
					</div>
				{/if}

				{#if order.status !== OrderStatus.QUOTE}
					<div>
						<div class="flex items-center text-gray-600">
							<Icon class="mr-2 text-gray-500" data={faTruck} />
							<span>Recogida</span>
						</div>
						<div class="font-semibold">
							{#if order.item.instantDelivery}
								Al momento
							{:else}
								{DateTime.fromJSDate(order.item.deliveryDate).toFormat('dd/MM/yyyy')}
							{/if}
						</div>
					</div>
				{/if}
			</div>
			<div class="space-y-3 p-3 text-sm">
				<div>
					<div class="flex items-center text-gray-600">
						<Icon class="mr-2 text-gray-500" data={faCoins} />
						<span>Pagado</span>
					</div>
					<div class="font-semibold">
						{#if payed}
							Sí
						{:else}
							No
						{/if}
					</div>
				</div>
				{#if order.status === OrderStatus.FINISHED}
					<div>
						<div class="flex items-center text-gray-600">
							<Icon class="mr-2 text-gray-500" data={faLocationDot} />
							<span>Ubicación</span>
						</div>
						<div class="font-semibold">
							{order.location.length === 0 ? 'Sin ubicación' : order.location}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<div class="rounded-lg bg-gray-100 px-4 py-2 text-sm">
			{order.item.description}
		</div>
	</div>

	<!-- Footer Section -->
	<div class="flex justify-between bg-gray-50 p-3">
		<div class="flex flex-row items-center justify-between gap-1 px-3">
			{#if order.status === OrderStatus.FINISHED && order.notified}
				<div class="flex animate-pulse items-center rounded-full bg-green-100 p-1">
					<Icon scale={1} data={faCheckCircle} class="text-green-500" />
				</div>
				<span class="text-sm font-semibold text-green-600"> Cliente avisado </span>
			{/if}
		</div>
		<div class="flex justify-end">
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
</div>

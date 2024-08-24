<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import {
		faCheckCircle,
		faHourglassHalf,
		faTimesCircle,
		faClipboardList
	} from '@fortawesome/free-solid-svg-icons';
	import { faCreditCard } from '@fortawesome/free-regular-svg-icons';
	import { OrderStatus } from '$lib/type/order.type';
	import { orderStatusMap } from '$lib/shared/order.utilities';
	import { DateTime } from 'luxon';
	import type { Order } from '$lib/type/api.type';

	export let totalOrder: number;
	export let order: Order;
</script>

<div class="flex w-full flex-col gap-2">
	<hr class="mb-3 mt-2 border-t border-gray-200 lg:col-span-2" />
	<span class="flex items-center rounded-lg bg-gray-200 px-3 py-1 text-lg text-gray-700">
		<Icon class="mr-2" data={faCreditCard} />
		Total {totalOrder.toFixed(2)} €
	</span>

	{#if order.status !== OrderStatus.QUOTE}
		{#if order.amountPayed === 0}
			<span class="flex items-center rounded-lg bg-red-200 px-3 py-1 text-lg text-red-700">
				<Icon class="mr-2" data={faTimesCircle} />
				No pagado
			</span>
		{:else if order.amountPayed === totalOrder}
			<span class="flex items-center rounded-lg bg-green-200 px-3 py-1 text-lg text-green-700">
				<Icon class="mr-2" data={faCheckCircle} />
				Pagado
			</span>
		{:else}
			<span class="flex items-center rounded-lg bg-yellow-200 px-3 py-1 text-lg text-yellow-700">
				<Icon class="mr-2" data={faHourglassHalf} />
				{order.amountPayed.toFixed(2)}€ pagado - {(totalOrder - order.amountPayed).toFixed(2)}€
				pendiente
			</span>
		{/if}
	{/if}

	<span
		class="flex items-center rounded-lg px-3 py-1 text-lg"
		class:bg-gray-200={OrderStatus.PENDING === order.status}
		class:text-gray-700={OrderStatus.PENDING === order.status}
		class:bg-green-200={OrderStatus.FINISHED === order.status}
		class:text-green-700={OrderStatus.FINISHED === order.status}
		class:bg-purple-200={OrderStatus.QUOTE === order.status}
		class:text-purple-700={OrderStatus.QUOTE === order.status}
		class:bg-blue-200={OrderStatus.PICKED_UP === order.status}
		class:text-blue-700={OrderStatus.PICKED_UP === order.status}
		class:bg-red-200={OrderStatus.DELETED === order.status}
		class:text-red-700={OrderStatus.DELETED === order.status}
	>
		<Icon
			class="mr-2"
			data={OrderStatus.PENDING === order.status
				? faHourglassHalf
				: OrderStatus.FINISHED === order.status
					? faCheckCircle
					: OrderStatus.QUOTE === order.status
						? faClipboardList
						: OrderStatus.PICKED_UP === order.status
							? faCheckCircle
							: OrderStatus.DELETED === order.status
								? faTimesCircle
								: faTimesCircle}
		/>
		{orderStatusMap[order.status]} - {DateTime.fromJSDate(order.statusUpdated).toFormat(
			'dd/MM/yyyy HH:mm'
		)}
	</span>
</div>

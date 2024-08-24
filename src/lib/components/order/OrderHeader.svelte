<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { faUserLarge } from '@fortawesome/free-solid-svg-icons/faUserLarge';
	import { faClock } from '@fortawesome/free-solid-svg-icons/faClock';
	import { DateTime } from 'luxon';
	import { OrderStatus } from '$lib/type/order.type';
	import { OrderUtilites } from '$lib/shared/order.utilities';
	import type { Order } from '$lib/type/api.type';

	export let order: Order;

	// Determine gradient based on order status
	let gradientClasses = '';
	switch (order.status) {
		case OrderStatus.PENDING:
			gradientClasses = 'from-gray-800 via-gray-700 to-gray-600';
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
			{order.status === OrderStatus.QUOTE ? 'Presupuesto' : 'Pedido'}
		</h3>
		<div class="overflow-hidden overflow-ellipsis whitespace-nowrap text-[0.6rem]">
			<span class="rounded-lg bg-white px-2 py-1 font-mono text-gray-800">
				{OrderUtilites.getOrderPublicId(order)}
			</span>
		</div>
	</div>

	<!-- Order Details -->
	<div class="space-y-3 bg-white p-4">
		<div class="flex items-center text-lg text-gray-700">
			<Icon class="mr-2 text-blue-600" data={faUserLarge} />
			<span>{order.customer.name}</span>
		</div>
		<div class="text-md flex items-center text-gray-700">
			<Icon class="mr-2 text-gray-600" data={faClock} />
			<span>{DateTime.fromJSDate(order.createdAt).toFormat('dd/MM/yyyy HH:mm')}</span>
		</div>
	</div>
</div>

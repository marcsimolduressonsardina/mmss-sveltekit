<script lang="ts">
	import { DateTime } from 'luxon';
	import { goto } from '$app/navigation';
	import type { Order, OrderFromList } from '$lib/type/api.type';
	import OrderId from '$lib/components/OrderId.svelte';
	import { Icon } from 'svelte-awesome';
	import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
	import { orderStatusMap } from '$lib/shared/order.utilities';
	import { OrderStatus } from '$lib/type/order.type';

	export let order: Order | OrderFromList;
</script>

<div
	class="w-full rounded-md bg-gray-300 p-5 shadow-sm"
	class:bg-gray-300={OrderStatus.PENDING === order.status}
	class:bg-green-300={OrderStatus.FINISHED === order.status}
	class:bg-blue-300={OrderStatus.PICKED_UP === order.status}
>
	<OrderId {order} /> <span class="variant-ghost badge">{orderStatusMap[order.status].toUpperCase()}</span>
	<p>{new Date(order.createdAt).toLocaleString()}</p>
	<p class="font-medium">
		Recogida: {DateTime.fromJSDate(order.item.deliveryDate).toFormat('dd/MM/yyyy')}
	</p>
	<p class="font-medium">Descripción: {order.item.description}</p>

	<button class="variant-filled btn btn-sm mt-1" on:click={() => goto(`/orders/${order.id}`)}
		><Icon class="mr-2" data={faEye} />Ver pedido</button
	>
</div>

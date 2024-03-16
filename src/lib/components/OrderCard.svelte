<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Order } from '$lib/type/api.type';
	import OrderId from '$lib/components/OrderId.svelte';
	import { Icon } from 'svelte-awesome';
	import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';

	export let order: Order;
</script>

<div class="w-full rounded-md bg-slate-50 p-5 shadow-sm">
	<OrderId {order} />
	<p>{new Date(order.createdAt).toLocaleString()}</p>
	<button class="variant-filled btn btn-sm mt-1" on:click={() => goto(`/orders/${order.id}`)}
		><Icon class="mr-2" data={faEye} />Ver pedido</button
	>
</div>

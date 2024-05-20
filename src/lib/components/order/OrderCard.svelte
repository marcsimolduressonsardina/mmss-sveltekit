<script lang="ts">
	import { DateTime } from 'luxon';
	import { goto } from '$app/navigation';
	import type { Order } from '$lib/type/api.type';
	import { Icon } from 'svelte-awesome';
	import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
	import { faSignHanging } from '@fortawesome/free-solid-svg-icons/faSignHanging';
	import { faTruck } from '@fortawesome/free-solid-svg-icons/faTruck';
	import { faClock } from '@fortawesome/free-solid-svg-icons/faClock';
	import { faChain } from '@fortawesome/free-solid-svg-icons/faChain';
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';
	import { faUserLarge } from '@fortawesome/free-solid-svg-icons/faUserLarge';
	import { OrderUtilites, orderStatusMap, tempCustomerUuid } from '$lib/shared/order.utilities';
	import { OrderStatus } from '$lib/type/order.type';

	export let order: Order;
	export let showCustomer: boolean = true;
</script>

<div
	class="w-full rounded-lg bg-gray-300 p-3 shadow-sm md:p-5"
	class:bg-gray-300={OrderStatus.PENDING === order.status}
	class:bg-lime-300={OrderStatus.FINISHED === order.status}
	class:bg-blue-300={OrderStatus.PICKED_UP === order.status}
>
	<div>
		<span class="variant-ghost badge">
			<Icon class="mr-1" data={faSignHanging} />
			{orderStatusMap[order.status].toUpperCase()}
		</span>

		<span class="variant-ghost-secondary badge">
			<Icon class="mr-1" data={faBox} />
			{OrderUtilites.getOrderPublicId(order)}
		</span>

		<span class="variant-ghost-success badge">
			<Icon class="mr-1" data={faClock} />
			{DateTime.fromJSDate(order.item.createdAt).toFormat('dd/MM/yyyy HH:mm')}
		</span>

		{#if showCustomer && order.customer.id !== tempCustomerUuid}
			<span class="variant-ghost-tertiary badge">
				<Icon class="mr-1" data={faUserLarge} />
				{order.customer.name}
			</span>
		{/if}

		{#if order.customer.id === tempCustomerUuid}
			<span class="variant-ghost-error badge">
				<Icon class="mr-1" data={faUserLarge} />
				Pedido sin vincular
			</span>
		{/if}

		<span class="variant-ghost-warning badge">
			<Icon class="mr-1" data={faTruck} />
			Recogida: {DateTime.fromJSDate(order.item.deliveryDate).toFormat('dd/MM/yyyy')}
		</span>
	</div>

	<div class="card mb-3 mt-3 p-3">{order.item.description}</div>

	<div>
		<button class="variant-filled btn btn-sm mt-1" on:click={() => goto(`/orders/${order.id}`)}>
			{#if order.customer.id === tempCustomerUuid}
				<Icon class="mr-1" data={faChain} /> Vincular pedido
			{:else}
				<Icon class="mr-1" data={faEye} /> Ver pedido
			{/if}
		</button>
	</div>
</div>

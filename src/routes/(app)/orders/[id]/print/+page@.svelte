<script lang="ts">
	import type { PageData } from './$types';
	import OrderPrint from '$lib/components/order/OrderPrint.svelte';
	export let data: PageData;
	const order = data.order!;
	const calculatedItem = data.calculatedItem!;
</script>

<OrderPrint {order} {calculatedItem} isForCustomer={false}></OrderPrint>

<script lang="ts">
	import type { PageData } from './$types';
	import OrderForm from '$lib/components/order/OrderForm.svelte';

	export let data: PageData;
</script>

<OrderForm {data} />
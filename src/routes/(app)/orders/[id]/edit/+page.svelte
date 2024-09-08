<script lang="ts">
	import OrderForm from '$lib/components/order/OrderForm.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<OrderForm {data}></OrderForm>

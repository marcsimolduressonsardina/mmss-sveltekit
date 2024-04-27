<script lang="ts">
	import type { PageData } from './$types';
	import NewCustomer from '$lib/components/customer/NewCustomer.svelte';

	export let data: PageData;
</script>

<NewCustomer {data} title={'Añadir cliente al pedido'} buttonText={'Vincular'} />

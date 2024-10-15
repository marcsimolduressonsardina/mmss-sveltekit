<script lang="ts">
	import NewCustomer from '$lib/components/customer/NewCustomer.svelte';
	export let data;
</script>

<NewCustomer {data} title={'Editar Cliente'} buttonText={'Editar'} />

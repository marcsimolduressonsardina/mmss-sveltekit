<script lang="ts">
	import type { PageData } from './$types';
	import { Icon } from 'svelte-awesome';
	import { faUserLarge } from '@fortawesome/free-solid-svg-icons/faUserLarge';
	import NewCustomer from '$lib/components/customer/NewCustomer.svelte';

	export let data: PageData;
</script>

<div class="pb-2">
	<aside class="alert variant-filled-secondary">
		<!-- Icon -->
		<div><Icon scale={3} data={faUserLarge} /></div>
		<!-- Message -->
		<div class="alert-message">
			<h3 class="h3">Vincular cliente al pedido</h3>
			<p>Rellene sólo el teléfono, si el cliente no existe, tendrá que poner su nombre.</p>
		</div>
	</aside>
</div>

<NewCustomer {data} title={''} buttonText={'Vincular'} />

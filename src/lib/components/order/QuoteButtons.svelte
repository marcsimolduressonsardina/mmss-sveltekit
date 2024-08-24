<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';
	import { faWhatsapp } from '@fortawesome/free-brands-svg-icons/faWhatsapp';
	import { OrderUtilites } from '$lib/shared/order.utilities';
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';
	import { CustomerUtilites } from '$lib/shared/customer.utilities';
	import type { Order } from '$lib/type/api.type';
	import { goto } from '$app/navigation';

	export let order: Order;
</script>

<a
	class="variant-filled-success btn btn-sm w-full"
	target="_blank"
	href={CustomerUtilites.getWhatsappLink(order.customer, OrderUtilites.getWhatsappQuoteText(order))}
	><Icon class="mr-1" data={faWhatsapp} /> Enviar presupuesto a cliente
</a>

<a class="variant-filled-warning btn btn-sm w-full" href="/customers/{order.customer.id}"
	><Icon class="mr-1" data={faUser} />Ver cliente</a
>

<button
	class="variant-filled btn btn-sm w-full"
	on:click={() => {
		goto(`/orders/${order.id}/promote`);
	}}
>
	<Icon class="mr-1" data={faBox} /> Convertir en pedido
</button>

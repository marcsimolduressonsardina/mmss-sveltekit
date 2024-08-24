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

<!-- Enviar presupuesto a cliente -->
<a
	class="flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-white shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
	target="_blank"
	href={CustomerUtilites.getWhatsappLink(order.customer, OrderUtilites.getWhatsappQuoteText(order))}
>
	<Icon class="mr-2" data={faWhatsapp} /> Enviar presupuesto a cliente
</a>

<!-- Ver cliente -->
<a
	class="flex w-full items-center justify-center rounded-md bg-yellow-600 px-4 py-2 text-white shadow hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:ring-offset-2"
	href="/customers/{order.customer.id}"
>
	<Icon class="mr-2" data={faUser} /> Ver cliente
</a>

<!-- Convertir en pedido -->
<button
	class="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
	on:click={() => {
		goto(`/orders/${order.id}/promote`);
	}}
>
	<Icon class="mr-2" data={faBox} /> Convertir en pedido
</button>

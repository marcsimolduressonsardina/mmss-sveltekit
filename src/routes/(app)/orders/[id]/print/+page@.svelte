<script lang="ts">
	import { OrderUtilites } from '$lib/shared/order.utilities';
	import type { PageData } from './$types';

	export let data: PageData;
	const order = data.order!;
</script>

<table border="1">
	<tr>
		<th colspan="3">
			Pedido {OrderUtilites.getOrderPublicId(order)}
		</th>
	</tr>
	<tr>
		<td colspan="2">{order.userName}</td>
		<td>{new Date(order.createdAt).toLocaleString()}</td>
	</tr>
	<tr>
		<th>Moldura</th>
		<th>PP</th>
		<th>Fondo</th>
	</tr>
	<tr>
		<td>
			{#each OrderUtilites.getOrderMolds(order) as mold}
				{ mold }
			{/each}
		</td>
		<td>PP</td>
		<td>Fondo</td>
	</tr>
</table>

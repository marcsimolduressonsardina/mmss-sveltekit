<script lang="ts">
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';
	import Icon from 'svelte-awesome';
	import { OrderUtilites } from '$lib/shared/order.utilities';
	import type { Order } from '$lib/type/api.type';
	export let order: Order;
</script>

<i class="font-bold"><Icon data={faBox} /> {OrderUtilites.getOrderPublicId(order)}</i>

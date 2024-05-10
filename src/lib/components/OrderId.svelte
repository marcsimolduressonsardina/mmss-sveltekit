<script lang="ts">
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';
	import Icon from 'svelte-awesome';
	import { OrderUtilites } from '$lib/shared/order.utilities';
	import type { Order, OrderFromList } from '$lib/type/api.type';
	export let order: Order | OrderFromList;
</script>

<i class="font-bold"><Icon data={faBox} /> {OrderUtilites.getOrderPublicId(order)}</i>

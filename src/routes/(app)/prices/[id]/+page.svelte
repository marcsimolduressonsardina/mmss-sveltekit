<script lang="ts">
	import PriceEdit from '$lib/components/price/PriceEdit.svelte';
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<PriceEdit {data} isNew={false} />

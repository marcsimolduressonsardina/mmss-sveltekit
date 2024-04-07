<script lang="ts">
	import type { PageData } from '../$types';
	import PriceEdit from '$lib/components/price/PriceEdit.svelte';
	export let data: PageData;
</script>

<PriceEdit {data} isNew={true} />

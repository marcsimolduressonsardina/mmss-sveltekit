<script lang="ts">
	import Icon from 'svelte-awesome';
	import type { IconType } from 'svelte-awesome/components/Icon.svelte';

	export let icon: IconType;
	export let text: string;
</script>

<Icon class="mr-2" data={icon} />
{text}

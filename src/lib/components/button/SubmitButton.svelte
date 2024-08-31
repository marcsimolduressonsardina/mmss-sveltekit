<script lang="ts">
	import { goto } from '$app/navigation';
	import { BUTTON_DEFAULT_CLASSES } from '$lib/ui/ui.constants';
	import Icon from 'svelte-awesome';
	import type { IconType } from 'svelte-awesome/components/Icon.svelte';

	export let icon: IconType;
	export let text: string;
	export let colorClasses;
	export let textWhite: boolean = true;
</script>

<button
	class={`${colorClasses} ${textWhite ? 'text-white' : 'text-gray-800'} ${BUTTON_DEFAULT_CLASSES} `}
	type="submit"
>
	<Icon class="mr-2" data={icon} />
	{text}
</button>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { BUTTON_DEFAULT_CLASSES } from '$lib/ui/ui.constants';
	import Icon from 'svelte-awesome';
	import type { IconType } from 'svelte-awesome/components/Icon.svelte';

	export let link: string;
	export let icon: IconType;
	export let text: string;
	export let colorClasses;
	export let newWindow: Boolean = false;
</script>

{#if !newWindow}
	<button class={`${colorClasses} ${BUTTON_DEFAULT_CLASSES}`} on:click={() => goto(link)}>
		<Icon class="mr-2" data={icon} />
		{text}
	</button>
{:else}
	<a class={`${colorClasses} ${BUTTON_DEFAULT_CLASSES}`} href={link} target="_blank">
		<Icon class="mr-2" data={icon} />
		{text}
	</a>
{/if}

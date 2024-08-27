<script lang="ts">
	import { goto } from '$app/navigation';
	import { BUTTON_DEFAULT_CLASSES, DISABLED_COLORS } from '$lib/ui/ui.constants';
	import Icon from 'svelte-awesome';
	import type { IconType } from 'svelte-awesome/components/Icon.svelte';

	export let link: string;
	export let icon: IconType;
	export let text: string;
	export let colorClasses;
	export let disabled: boolean = false;
	export let forceLink: boolean = false;
	export let newWindow: boolean = false;
</script>

{#if (!newWindow || disabled) && !forceLink}
	<button
		{disabled}
		class={`${disabled ? DISABLED_COLORS : colorClasses} ${BUTTON_DEFAULT_CLASSES}`}
		on:click={() => goto(link)}
	>
		<Icon class="mr-2" data={icon} />
		{text}
	</button>
{:else}
	<a
		class={`${colorClasses} ${BUTTON_DEFAULT_CLASSES}`}
		href={link}
		target={newWindow ? '_blank' : '_self'}
	>
		<Icon class="mr-2" data={icon} />
		{text}
	</a>
{/if}

<script lang="ts">
	import { goto } from '$app/navigation';
	import type { IconType } from 'svelte-awesome/components/Icon.svelte';
	import ClickButton from './ClickButton.svelte';
	import LinkButton from './LinkButton.svelte';

	export let link: string;
	export let icon: IconType;
	export let text: string;
	export let colorClasses: string;
	export let disabled: boolean = false;
	export let forceLink: boolean = false;
	export let newWindow: boolean = false;
	export let textWhite: boolean = true;
	export let homeButton: boolean = false;
	export let tooltipText: string | undefined = undefined;
</script>

{#if disabled}
	<ClickButton
		{text}
		{disabled}
		{textWhite}
		{colorClasses}
		{homeButton}
		{icon}
		{tooltipText}
		onClick={() => goto(link)}
	></ClickButton>
{:else if !newWindow && !forceLink}
	<ClickButton
		{text}
		{disabled}
		{textWhite}
		{colorClasses}
		{homeButton}
		{icon}
		onClick={() => goto(link)}
	></ClickButton>
{:else}
	<LinkButton {newWindow} {text} {link} {textWhite} {colorClasses} {homeButton} {icon}></LinkButton>
{/if}

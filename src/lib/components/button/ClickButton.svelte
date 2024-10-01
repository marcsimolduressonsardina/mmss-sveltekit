<script lang="ts">
	import { generateButtonClasses } from '$lib/ui/ui.helper';
	import type { IconType } from 'svelte-awesome/components/Icon.svelte';
	import InnerButton from './InnerButton.svelte';
	import Icon from 'svelte-awesome/components/Icon.svelte';
	import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';

	export let icon: IconType;
	export let disabled: boolean = false;
	export let text: string;
	export let colorClasses: string;
	export let textWhite: boolean = true;
	export let homeButton: boolean = false;
	export let onClick: (event: MouseEvent) => void;
	export let tooltipText: string | undefined = undefined;
</script>

<div class="group relative w-full">
	<button
		{disabled}
		class={generateButtonClasses(textWhite, colorClasses, disabled, homeButton)}
		on:click={onClick}
	>
		<InnerButton {icon} {text}></InnerButton>
	</button>

	{#if disabled && tooltipText != null}
		<div
			class="absolute left-1/2 z-10 mt-2 hidden -translate-x-1/2 transform rounded-lg bg-gray-800 px-4 py-2 text-base text-white group-hover:block"
		>
			<Icon data={faExclamationTriangle} class="mr-2"></Icon>{tooltipText}
		</div>
	{/if}
</div>

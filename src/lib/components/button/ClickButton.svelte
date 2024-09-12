<script lang="ts">
	import { generateButtonClasses } from '$lib/ui/ui.helper';
	import type { IconType } from 'svelte-awesome/components/Icon.svelte';
	import InnerButton from './InnerButton.svelte';

	export let icon: IconType;
	export let disabled: boolean = false;
	export let text: string;
	export let colorClasses: string;
	export let textWhite: boolean = true;
	export let homeButton: boolean = false;
	export let onClick: (event: MouseEvent) => void;
</script>

<button
	{disabled}
	class={generateButtonClasses(textWhite, colorClasses, disabled, homeButton)}
	on:click={onClick}
>
	<InnerButton {icon} {text}></InnerButton>
</button>

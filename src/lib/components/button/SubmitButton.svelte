<script lang="ts">
	import { generateButtonClasses } from '$lib/ui/ui.helper';
	import type { IconType } from 'svelte-awesome/components/Icon.svelte';
	import InnerButton from './InnerButton.svelte';

	export let icon: IconType;
	export let text: string;
	export let colorClasses: string;
	export let textWhite: boolean = true;
	export let homeButton: boolean = false;
</script>

<button class={generateButtonClasses(textWhite, colorClasses, false, homeButton)} type="submit">
	<InnerButton {icon} {text}></InnerButton>
</button>

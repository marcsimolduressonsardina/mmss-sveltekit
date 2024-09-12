<script lang="ts">
	import { generateButtonClasses } from '$lib/ui/ui.helper';
	import type { IconType } from 'svelte-awesome/components/Icon.svelte';
	import InnerButton from './InnerButton.svelte';

	export let link: string;
	export let icon: IconType;
	export let text: string;
	export let colorClasses: string;
	export let newWindow;
	export let textWhite: boolean = true;
	export let homeButton: boolean = false;
</script>

<a
	class={generateButtonClasses(textWhite, colorClasses, false, homeButton)}
	href={link}
	target={newWindow ? '_blank' : '_self'}
>
	<InnerButton {icon} {text}></InnerButton>
</a>

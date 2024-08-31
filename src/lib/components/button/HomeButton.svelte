<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from 'svelte-awesome';
	import type { IconType } from 'svelte-awesome/components/Icon.svelte';

	export let link: string;
	export let icon: IconType;
	export let text: string;
	export let textWhite: boolean = true;
	export let colorClasses;
</script>

<button
	on:click={() => goto(link)}
	class={`w-full rounded-lg ${colorClasses} px-6 py-4 text-left text-lg font-semibold ${textWhite ? 'text-white' : 'text-gray-800'} shadow-lg focus:outline-none focus:ring-4`}
>
	<Icon class="mr-2" data={icon} />
	{text}
</button>

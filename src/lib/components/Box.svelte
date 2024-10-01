<script lang="ts">
	import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import { Icon } from 'svelte-awesome';

	export let title: string | undefined = undefined;
	export let icon: IconDefinition | undefined = undefined;
</script>

<div class="space-y-4 rounded-lg bg-white p-4 shadow-md">
	{#if title}
		<div class="text-xl font-semibold text-gray-900">
			{#if icon}<Icon class="mr-2" data={icon} />
			{/if}
			{title}
		</div>
	{/if}

	<div>
		<slot></slot>
	</div>
</div>

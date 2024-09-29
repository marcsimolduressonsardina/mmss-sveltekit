<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import type { IconType } from 'svelte-awesome/components/Icon.svelte';

	export let gradientClasses: string;
	export let icon: IconType;
	export let title: string;
	export let text: string;
</script>

<div class={`rounded-lg bg-gradient-to-r p-6 text-white shadow-md ${gradientClasses}`}>
	<div class="flex flex-row items-center space-x-4">
		<div class="col-span-1">
			<Icon scale={3} data={icon} />
		</div>
		<div class="col-span-2">
			<h3 class="text-xl font-bold">{title}</h3>
			<p class="text-sm">{text}</p>
		</div>
	</div>
</div>

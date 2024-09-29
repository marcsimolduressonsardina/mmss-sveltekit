<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import type { IconType } from 'svelte-awesome/components/Icon.svelte';

	export let gradientClasses: string;
	export let baseColor: string = 'green';
	export let icon: IconType;
	export let title: string;
	export let text: string;
	export let small: boolean = false;
</script>

<div
	class={`rounded-lg bg-gradient-to-r ${small ? 'p-1' : 'p-6'} text-white shadow-md ${gradientClasses}`}
>
	{#if small}
		<div
			class="flex flex-row items-center justify-center space-x-3 rounded-md bg-white p-2 shadow-inner md:p-1"
		>
			<div class="flex items-center rounded-full bg-{baseColor}-100 animate-pulse p-1">
				<Icon scale={1} data={icon} class="text-{baseColor}-500" />
			</div>
			<h3 class="text-md font-semibold text-{baseColor}-700">{title}</h3>
		</div>
	{:else}
		<div class="flex flex-row items-center space-x-4">
			<div class="col-span-1">
				<Icon scale={3} data={icon} />
			</div>
			<div class="col-span-2">
				<h3 class="text-xl font-bold">{title}</h3>
				<p class="text-sm">{text}</p>
			</div>
		</div>
	{/if}
</div>

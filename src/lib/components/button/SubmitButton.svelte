<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from 'svelte-awesome';
	import type { IconType } from 'svelte-awesome/components/Icon.svelte';

	export let icon: IconType;
	export let text: string;
	export let colorClasses;
</script>

<button
	class={`${colorClasses} w-full rounded-md px-4 py-2 text-center font-semibold text-white shadow  focus:outline-none focus:ring-2  focus:ring-offset-2`}
	type="submit"
>
	<Icon class="mr-2" data={icon} />
	{text}
</button>

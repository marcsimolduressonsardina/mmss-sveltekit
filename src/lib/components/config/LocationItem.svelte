<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { faLocationDot } from '@fortawesome/free-solid-svg-icons/faLocationDot';

	export let text: string;
</script>

<div
	class="flex transform items-center justify-between rounded-xl bg-gray-200 p-4 shadow-lg hover:shadow-2xl"
>
	<div class="flex items-center">
		<Icon class="mr-2 text-gray-900" data={faLocationDot} />
		<span class="text-lg text-gray-800">
			{text}
		</span>
	</div>
	<div>
		<slot></slot>
	</div>
</div>

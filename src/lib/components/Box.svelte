<script lang="ts">
	export let title: string | undefined = undefined;
</script>

<div class="space-y-4 rounded-lg bg-white p-4 shadow-md">
	{#if title}
		<div class="text-xl font-semibold text-gray-900">{title}</div>
	{/if}

	<div>
		<slot></slot>
	</div>
</div>

<script lang="ts">
	export let title;
</script>

<div class="space-y-4 rounded-lg bg-white p-4 shadow-md">
	<div class="text-xl font-semibold text-gray-900">{title}</div>

	<div>
		<slot></slot>
	</div>
</div>

<script lang="ts">
	export let text = 'Cargando...';
</script>

<div class="w-full pt-2 text-center">
	<div
		class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-black motion-reduce:animate-[spin_1.5s_linear_infinite]"
		role="status"
	></div>
	<p class="pt-5 text-lg font-semibold text-gray-800">{text}</p>
	<p class="text-sm italic text-gray-600">Un momento, por favor...</p>
</div>

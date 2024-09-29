<script lang="ts">
	export let text: string | undefined = undefined;
</script>

<div class="flex w-full flex-col items-center pt-4 text-center">
	<div class="relative flex h-10 w-10 items-center justify-center">
		<!-- Outer glow with fuchsia and blue -->
		<div
			class="animate-glow absolute z-[0] h-full w-full rounded-lg bg-gradient-to-br from-fuchsia-500 to-blue-500 opacity-80 blur-md"
		></div>
		<!-- Rotating square -->
		<div
			class="absolute z-[1] h-full w-full animate-[loadtwo_3s_ease-in-out_infinite] rounded-lg bg-gradient-to-br from-indigo-700 to-indigo-400 blur-[0.5px]"
		></div>
	</div>
	<div class="pt-2.5">
		{#if text != null}
			<p class="text-md animate-pulse font-semibold text-gray-800">{text}</p>
		{/if}
		<p class="animate-fadeIn text-xs italic text-gray-600">Un momento, por favor...</p>
	</div>
</div>

<script lang="ts">
	export let text: string | undefined;
</script>

<div class="flex w-full flex-col items-center pt-2 text-center">
	<div class="relative flex h-20 w-20 items-center justify-center">
		<div
			class="absolute z-[1] h-full w-full animate-[loadtwo_2.5s_ease-in-out_infinite] rounded-[30px] bg-gradient-to-br from-gray-400 to-blue-600 blur-[1px]"
		></div>
		<div
			class="absolute z-[2] h-full w-full rounded-[30px] border-2 border-gray-300 bg-gray-200/20"
		></div>
	</div>
	<div class="pt-5">
		{#if text != null}
			<p class="animate-pulse text-lg font-semibold text-gray-800">{text}</p>
		{/if}
		<p class="animate-fadeIn text-sm italic text-gray-600">Un momento, por favor...</p>
	</div>
</div>

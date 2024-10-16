<script lang="ts">
	export let text: string | undefined = undefined;
</script>

<div class="flex w-full flex-col items-center overflow-visible p-7 text-center">
	<div class="relative flex h-16 w-16 items-center justify-center overflow-visible">
		<!-- Siri-like glow effect -->
		<div
			class="animate-siriGlow absolute z-[0] h-full w-full rounded-lg bg-gradient-to-br from-fuchsia-500 to-blue-500 opacity-90 blur-lg"
		></div>
		<!-- Gray box with white icon -->
		<div class="absolute z-[1] flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800">
			<!-- Image with the icon -->
			<img src="/mmss_favicon_white.ico" alt="Icon" class="h-7 w-7" />
		</div>
	</div>

	<div class="relative z-[1] pt-1">
		<!-- Ensures the text container is above other elements except glow -->
		{#if text != null}
			<div class="mt-2 rounded-full bg-gray-800 px-3 py-1.5 text-white shadow-lg">
				<p class="text-sm font-medium">{text}</p>
				<!-- Smaller and medium weight for a more refined look -->
			</div>
		{/if}
	</div>

	<div class="z-[0] pt-2.5">
		<!-- Ensure this is below the glow -->
		<p class="animate-fadeIn text-xs italic text-gray-500">Un momento, por favor...</p>
		<!-- Smaller and lighter style -->
	</div>
</div>

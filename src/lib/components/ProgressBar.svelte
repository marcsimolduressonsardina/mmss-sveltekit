<script lang="ts">
	import { ProgressBar } from '@skeletonlabs/skeleton';
	export let text = 'Cargando...';
</script>

<div class="w-full pt-4 text-center">
	<ProgressBar />
	<p class="pt-5 font-medium">{text}</p>
</div>

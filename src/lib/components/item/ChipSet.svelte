<script lang="ts">
	import ObservationChip from './ObservationChip.svelte';
	export let observations: string[];
	export let filledObservations: string[];
	export let addFunction: (text: string) => void;
	export let removeFunction: (text: string) => void;
</script>

{#each observations as observation}
	<ObservationChip
		text={observation}
		{addFunction}
		{removeFunction}
		clicked={filledObservations.indexOf(observation) > -1}
	/>
{/each}

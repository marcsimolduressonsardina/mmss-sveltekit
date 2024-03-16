<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import check from 'svelte-awesome/icons/check';

	let clicked = false;
    export let text: string;
    export let addFunction: (text: string) => void;
    export let removeFunction: (text: string) => void;
    
    function handleClick() {
        clicked = !clicked;
        if (clicked) {
            addFunction(text);
        } else {
            removeFunction(text);
        }
    }

</script>

<button type="button" on:click={() => handleClick()}>
	<span class="{ clicked ? 'variant-filled-secondary' : 'variant-filled'} chip w-full">
        {#if clicked}
            <Icon class="mr-2" data={check} />
        {/if}
		 {text}
	</span>
</button>

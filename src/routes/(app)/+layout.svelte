<script lang="ts">
	import type { LayoutData } from './$types';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { Toast, storePopup, initializeStores } from '@skeletonlabs/skeleton';
	import { AppBar, AppShell } from '@skeletonlabs/skeleton';
	import '../../app.pcss';
	import { Icon } from 'svelte-awesome';
	import home from 'svelte-awesome/icons/home';
	import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons/faRightFromBracket';
	import { faGear } from '@fortawesome/free-solid-svg-icons/faGear';
	initializeStores();
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	export let data: LayoutData;
</script>

<svelte:head>
	<title>Marcs i Moldures Son Sardina</title>
</svelte:head>
<Toast />
<AppShell>
	<svelte:fragment slot="header">
		<AppBar gridColumns="grid-cols-3" slotDefault="place-self-center" slotTrail="place-content-end">
			<svelte:fragment slot="lead">
				<a href="/"><Icon data={home} /></a>
			</svelte:fragment>
			Marcos App
			<svelte:fragment slot="trail">
				{#if data.user.priceManager}
					<a href="/config"><Icon data={faGear} /></a>
				{/if}
				<a href="/auth/signout?callbackUrl=/"><Icon data={faRightFromBracket} /></a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<div class="h-full bg-slate-100 p-2"><slot /></div>
</AppShell>

<script>
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { Toast, storePopup, initializeStores } from '@skeletonlabs/skeleton';
	import { AppBar, AppShell } from '@skeletonlabs/skeleton';
	import '../app.pcss';
	import { Icon } from 'svelte-awesome';
	import home from 'svelte-awesome/icons/home';
	import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons/faRightFromBracket';
	initializeStores();
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
</script>

<Toast />
<AppShell>
	<svelte:fragment slot="header">
		<AppBar gridColumns="grid-cols-3" slotDefault="place-self-center" slotTrail="place-content-end">
			<svelte:fragment slot="lead">
				<a href="/"><Icon data={home} /></a>
			</svelte:fragment>
			MMSS
			<svelte:fragment slot="trail">
				<a href="/auth/signout"><Icon data={faRightFromBracket} /></a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<div class="card m-1 bg-gray-100 p-2"><slot /></div>
</AppShell>

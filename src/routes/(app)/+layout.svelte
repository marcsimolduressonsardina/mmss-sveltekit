<script lang="ts">
	import type { LayoutData } from './$types';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { Toast, storePopup, initializeStores } from '@skeletonlabs/skeleton';
	import { navigating } from '$app/stores';
	import { AppBar, AppShell } from '@skeletonlabs/skeleton';
	import '../../app.pcss';
	import { Icon } from 'svelte-awesome';
	import home from 'svelte-awesome/icons/home';
	import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons/faRightFromBracket';
	import { faScrewdriverWrench } from '@fortawesome/free-solid-svg-icons/faScrewdriverWrench';
	import { faGear } from '@fortawesome/free-solid-svg-icons/faGear';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import Box from '$lib/components/Box.svelte';
	initializeStores();
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	let isNavigating = false;
	const unsubscribe = navigating.subscribe(($navigating) => {
		if ($navigating) {
			isNavigating = true;
		} else {
			isNavigating = false;
		}
	});

	export let data: LayoutData;
</script>

<svelte:head>
	<title>Marcs i Moldures Son Sardina</title>
</svelte:head>
<Toast />

{#if !data.inMaintenance}
	<AppShell>
		<svelte:fragment slot="header">
			<AppBar
				gridColumns="grid-cols-3"
				slotDefault="place-self-center"
				slotTrail="place-content-end"
			>
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
		<div class="h-full bg-slate-100 p-2">
			{#if isNavigating}
				<ProgressBar></ProgressBar>
			{:else}
				<slot />
			{/if}
		</div>
	</AppShell>
{:else}
	<div class="flex min-h-0 items-center justify-center pt-5 md:min-h-screen md:pt-0">
		<div class="space-y-3 px-4 md:w-1/4 md:px-0">
			<div class="flex w-full justify-center">
				<img
					class="w-1/2"
					src="https://marcsimoldures.com/wp-content/uploads/2017/02/MMlogo111.png"
					alt="logo"
				/>
			</div>

			<Box title="Fuera de servicio" icon={faScrewdriverWrench}>
				<div class="flex flex-col gap-2">
					<span>
						La aplicación se encuentra en mantenimiento en estos momentos, disculpe las molestias.
						Se reestablecerá el servicio lo antes posible.
					</span>
					<span class="w-full pt-5 text-center font-semibold"> Marcos App </span>
				</div>
			</Box>
		</div>
	</div>
{/if}

<script lang="ts">
	import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload';
	import { faVideo } from '@fortawesome/free-solid-svg-icons/faVideo';

	import { Icon } from 'svelte-awesome';
	import trash from 'svelte-awesome/icons/trash';

	export let isVideo = false;
	export let id = '';
	export let fileName = '';
	export let downloadUrl = '';
	export let onDelete = async (id: string) => {};

	async function deleteFile() {
		await onDelete(id);
	}
</script>

<div
	class="flex w-full flex-col items-center space-y-2 rounded-lg border bg-white p-2 shadow-sm md:flex-row md:space-x-4 md:space-y-0 md:p-4"
>
	<span class="md:truncate-none max-w-full flex-grow truncate text-gray-700 md:max-w-none"
		>{fileName}</span
	>
	<div class="flex w-full justify-end space-x-2 md:w-auto">
		<a
			href={downloadUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="w-full rounded bg-blue-500 px-3 py-1 text-center font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:w-auto"
		>
			{#if isVideo}
				<Icon class="mr-1" data={faVideo} /> Ver
			{:else}
				<Icon class="mr-1" data={faDownload} /> Descargar
			{/if}
		</a>
		<button
			on:click={deleteFile}
			class="w-full rounded bg-red-500 px-3 py-1 text-center font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 md:w-auto"
		>
			<Icon class="mr-1" data={trash} />
			Eliminar
		</button>
	</div>
</div>

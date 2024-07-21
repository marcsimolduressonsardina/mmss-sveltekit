<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';
	import { FileType, type File as MMSSFile } from '$lib/type/api.type';
	import Gallery from '$lib/components/order/Gallery.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import UploadedFile from '$lib/components/order/UploadedFile.svelte';
	import { Icon } from 'svelte-awesome';
	import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft';
	import { goto } from '$app/navigation';

	export let data: PageData;

	const toastStore = getToastStore();
	let inputFile: HTMLInputElement;

	let currentImageUrl = '';
	let currentImageId = '';
	let overlayVisible = false;
	let loading = false;
	$: files = data.files ?? [];

	function showOverlay(file: MMSSFile) {
		currentImageUrl = file.downloadUrl!;
		overlayVisible = true;
		currentImageId = file.id;
	}

	function hideOverlay() {
		overlayVisible = false;
		currentImageUrl = '';
		currentImageId = '';
	}

	function modulo(a: number, b: number): number {
		return ((a % b) + b) % b;
	}

	function nextImage(id: string) {
		const images = files.filter((f) => f.type === FileType.PHOTO);
		const index = images.findIndex((f) => f.id === id);
		const newIndex = modulo(index + 1, images.length);
		showOverlay(images[newIndex]);
	}

	function previousImage(id: string) {
		const images = files.filter((f) => f.type === FileType.PHOTO);
		const index = images.findIndex((f) => f.id === id);
		const newIndex = modulo(index - 1, images.length);
		showOverlay(images[newIndex]);
	}

	async function deleteFile(id: string) {
		if (!confirm('Estás seguro que quieres eliminar el archivo?')) {
			return;
		}

		loading = true;
		const response = await fetch(`/api/orders/${data!.order!.id}/files/${id}`, {
			method: 'DELETE',
			headers: {
				'content-type': 'application/json'
			}
		});

		if (response.status !== 200) {
			toastError('Error al eliminar el fichero');
			loading = false;
			return;
		}

		hideOverlay();
		loading = false;
		files = files.filter((f) => f.id != id);
	}

	async function createFile(filename: string): Promise<MMSSFile | undefined> {
		const response = await fetch(`/api/orders/${data!.order!.id}/files`, {
			method: 'POST',
			body: JSON.stringify({ filename }),
			headers: {
				'content-type': 'application/json'
			}
		});

		if (response.status !== 200) {
			toastError('Error al procesar el fichero');
			return;
		}

		const file = (await response.json()) as MMSSFile;
		return file;
	}

	async function getFile(id: string): Promise<MMSSFile | undefined> {
		const response = await fetch(`/api/orders/${data!.order!.id}/files/${id}`, {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		});

		if (response.status !== 200) {
			toastError('Error al obtener fichero');

			return;
		}

		const file = (await response.json()) as MMSSFile;
		return file;
	}

	async function loadFile() {
		if (inputFile.files == null || inputFile.files.length === 0) {
			toastError('Debes seleccionar un archivo');
			return;
		}

		loading = true;
		const filesToUpload = [...inputFile.files];
		const uploads = filesToUpload.map((f) => uploadIndividualFile(f));
		const results = await Promise.all(uploads);
		const uploadedFiles = results.filter((f) => f != null);
		files = [...files, ...uploadedFiles];
		loading = false;

		if (results.filter((f) => f == null).length > 0) {
			toastError('Algunos archivos no pudieron cargarse');
		}
	}

	async function uploadIndividualFile(fileToUpload: File): Promise<MMSSFile | undefined> {
		const file = await createFile(fileToUpload.name);
		if (file == null) return;
		await uploadToS3(file.uploadUrl!, fileToUpload);
		return getFile(file.id);
	}

	function toastError(message: string) {
		toastStore.trigger({
			message,
			background: 'variant-filled-error'
		});
	}

	async function uploadToS3(presignedUrl: string, file: File): Promise<boolean> {
		try {
			const response = await fetch(presignedUrl, {
				method: 'PUT',
				body: file
			});

			if (response.ok) {
				return true;
			} else {
				toastError('Ocurrió un error al cargar el archivo. Por favor, intente nuevamente.');
				return false;
			}
		} catch (error) {
			toastError('Ocurrió un error al cargar el archivo. Por favor, intente nuevamente.');
			return false;
		}
	}

	async function goBackToOrder() {
		await goto(`/orders/${data!.order!.id}`);
	}
</script>

<div class="space flex w-full flex-col gap-1 p-3">
	{#if loading}
		<ProgressBar />
	{:else}
		<!-- Title and Button Container -->
		<div class="flex items-center pb-2">
			<button
				on:click={goBackToOrder}
				class="flex items-center rounded-lg bg-gray-200 px-4 py-1 font-bold text-gray-700 hover:bg-gray-300"
			>
				<Icon class="mr-1" data={faArrowLeft} /> Volver al pedido
			</button>
		</div>

		<span class="mt-4 border-b border-gray-300 pb-1 text-xl font-semibold text-gray-700">
			Carga de archivos
		</span>
		<input class="input" type="file" multiple bind:this={inputFile} on:change={loadFile} />
		{#if files}
			{#if files.filter((f) => f.type === FileType.PHOTO).length > 0}
				<span class="mt-4 border-b border-gray-300 pb-1 text-xl font-semibold text-gray-700">
					Fotos
				</span>
				<div class="flex flex-wrap gap-2">
					{#each files.filter((f) => f.type === FileType.PHOTO) as image}
						<div
							class="h-20 w-20 cursor-pointer overflow-hidden rounded-lg"
							on:click={() => showOverlay(image)}
						>
							<img
								src={image.downloadUrl ?? ''}
								alt={image.originalFilename}
								class="h-full w-full object-cover"
							/>
						</div>
					{/each}
				</div>
			{/if}

			{#if files.filter((f) => f.type === FileType.VIDEO).length > 0}
				<span class="mt-4 border-b border-gray-300 pb-1 text-xl font-semibold text-gray-700">
					Vídeos
				</span>
				<div class="flex flex-wrap gap-2">
					{#each files.filter((f) => f.type === FileType.VIDEO) as file}
						<UploadedFile
							isVideo={true}
							fileName={file.originalFilename}
							downloadUrl={file.downloadUrl}
							onDelete={deleteFile}
							id={file.id}
						/>
					{/each}
				</div>
			{/if}

			{#if files.filter((f) => f.type === FileType.OTHER).length > 0}
				<span class="mt-4 border-b border-gray-300 pb-1 text-xl font-semibold text-gray-700">
					Otros Archivos
				</span>
				<div class="flex flex-wrap gap-2">
					{#each files.filter((f) => f.type === FileType.OTHER) as file}
						<UploadedFile
							fileName={file.originalFilename}
							downloadUrl={file.downloadUrl}
							onDelete={deleteFile}
							id={file.id}
						/>
					{/each}
				</div>
			{/if}
		{/if}

		<Gallery
			imageUrl={currentImageUrl}
			id={currentImageId}
			onDelete={deleteFile}
			bind:visible={overlayVisible}
			onClose={hideOverlay}
			onNext={nextImage}
			onPrevious={previousImage}
		/>
	{/if}
</div>

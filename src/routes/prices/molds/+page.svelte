<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { faFileExcel } from '@fortawesome/free-solid-svg-icons/faFileExcel';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import Icon from 'svelte-awesome';

	const toastStore = getToastStore();
	let inputFile: HTMLInputElement;
	let loadingText = '';
	let loading = false;

	async function loadFile() {
		if (validFile()) {
			const { filename, url } = await getUploadParams();
			const file = inputFile.files![0];
			loadingText = 'Cargando archivo...';
			loading = true;
			const uploadResult = await uploadToS3(url, file);
			if (uploadResult) {
				loadingText = 'Procesando archivo...';
				const processingResult = await startProcessing(filename);
				cleanUpload();
				if (processingResult) {
					loadingText = '';
					toastStore.trigger({
						message: 'Precios actualizados correctamente',
						background: 'variant-filled-success'
					});
				}
			} else {
				cleanUpload();
			}
		}
	}

	function cleanUpload() {
		if (inputFile) {
			inputFile.value = '';
		}
		loading = false;
	}

	function toastError(message: string) {
		toastStore.trigger({
			message,
			background: 'variant-filled-error'
		});
	}

	function validFile(): boolean {
		if (inputFile.files?.length !== 1) {
			toastError('Por favor, seleccione un archivo');
			return false;
		} else {
			const file = inputFile.files[0];
			const fileExtension = file.name.split('.').pop()?.toLowerCase() ?? '';
			const validExtensions = ['xls', 'xlsx'];

			if (!validExtensions.includes(fileExtension)) {
				toastError('Por favor, seleccione un archivo Excel (.xls o .xlsx)');
				return false;
			}
		}

		return true;
	}

	async function getUploadParams(): Promise<{ filename: string; url: string }> {
		const response = await fetch('/api/prices/molds/upload', {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		});

		return await response.json();
	}

	async function startProcessing(filename: string): Promise<boolean> {
		try {
			const response = await fetch('/api/prices/molds/upload', {
				method: 'POST',
				body: JSON.stringify({ filename }),
				headers: {
					'content-type': 'application/json'
				}
			});
			if (response.ok) {
				return true;
			} else {
				toastError('Ocurrió un error al procesar el archivo. Puede deberse a un error de formato.');
				return false;
			}
		} catch (error) {
			toastError('Ocurrió un error al procesar el archivo. Puede deberse a un error de formato.');
			return false;
		}
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
</script>

<div class="px-2 pt-1 text-xl font-semibold">Carga de precios de Marcos/Molduras</div>
<div class="flex w-full flex-col place-content-center items-center justify-center space-y-2 p-4">
	{#if loading}
		<ProgressBar text={loadingText} />
	{:else}
		<input class="input" type="file" bind:this={inputFile} />
		<button class="variant-filled-warning btn btn-xl shadow-sm" on:click={loadFile}
			><Icon class="mr-2" data={faFileExcel} /> Cargar archivo excel</button
		>
	{/if}
</div>

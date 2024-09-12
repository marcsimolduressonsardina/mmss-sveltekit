<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { faFileExcel } from '@fortawesome/free-solid-svg-icons/faFileExcel';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import Box from '$lib/components/Box.svelte';
	import { ACCIONES_NEUTRES_COLORS } from '$lib/ui/ui.constants';
	import ClickButton from '$lib/components/button/ClickButton.svelte';

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
				cleanUpload();
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

<Box title="Carga de precios de Marcos/Molduras">
	<div class="flex w-full flex-col place-content-center items-center justify-center space-y-4 p-4">
		{#if loading}
			<ProgressBar text={loadingText} />
		{:else}
			<input
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
				type="file"
				bind:this={inputFile}
			/>
			<ClickButton
				text="Cargar archivo excel"
				icon={faFileExcel}
				colorClasses={ACCIONES_NEUTRES_COLORS}
				onClick={loadFile}
			></ClickButton>
		{/if}
	</div>
</Box>

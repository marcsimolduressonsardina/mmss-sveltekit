<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import trash from 'svelte-awesome/icons/trash';
	import close from 'svelte-awesome/icons/close';

	export let imageUrl = '';
	export let id = '';
	export let visible = false;
	export let onClose = () => {};
	export let onDelete = async (id: string) => {};

	async function handleDelete() {
		await onDelete(id);
	}
</script>

{#if visible}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
		on:click={onClose}
	>
		<div class="absolute right-4 top-4 flex space-x-2">
			<button
				class="rounded-full bg-red-600 p-2 text-white shadow-lg hover:bg-red-700 focus:outline-none"
				on:click|stopPropagation={handleDelete}
			>
				<Icon class="mr-1" data={trash} /> Eliminar
			</button>
			<button
				class="rounded-full bg-gray-600 p-2 text-white shadow-lg hover:bg-gray-700 focus:outline-none"
				on:click|stopPropagation={onClose}
			>
				<Icon class="mr-1" data={close} /> Cerrar
			</button>
		</div>
		<img
			src={imageUrl}
			alt="Overlay Image"
			class="max-w-90% max-h-90% shadow-lg"
			on:click|stopPropagation
		/>
	</div>
{/if}

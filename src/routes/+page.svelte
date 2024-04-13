<script lang="ts">
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';

	import { faImage } from '@fortawesome/free-solid-svg-icons/faImage';
	import Icon from 'svelte-awesome';
	import plus from 'svelte-awesome/icons/plus';
	import search from 'svelte-awesome/icons/search';
</script>

<div
	class="flex w-full flex-col place-content-center items-center justify-center space-y-2 p-4 lg:flex-row lg:space-x-2 lg:space-y-0"
>
	<div class="w-full space-y-2 lg:w-1/2">
		<a href="/customers/new" class="variant-filled-warning btn btn-xl w-full shadow-sm"
			><Icon class="mr-2" data={plus} /> Crear cliente</a
		>
		<a href="/customers/search" class="variant-filled-surface btn btn-xl w-full shadow-sm"
			><Icon class="mr-2" data={search} /> Buscar cliente</a
		>
	</div>
	<div class="w-full space-y-2 lg:w-1/2">
		<a href="/orders/search" class="variant-filled btn btn-xl w-full shadow-sm"
			><Icon class="mr-2" data={faBox} /> Consultar Pedido</a
		>
		<a href="/orders/new" class="variant-filled-primary btn btn-xl w-full shadow-sm"
			><Icon class="mr-2" data={faImage} /> Crear presupuesto</a
		>
	</div>
</div>

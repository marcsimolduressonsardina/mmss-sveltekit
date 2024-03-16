<script lang="ts">
	import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';
	import Icon from 'svelte-awesome';
	import plus from 'svelte-awesome/icons/plus';
	import search from 'svelte-awesome/icons/search';
</script>

<div
	class="flex w-full flex-col place-content-center items-center justify-center space-y-4 p-4 lg:flex-row lg:space-x-4 lg:space-y-0"
>
	<a href="/customers/new" class="variant-filled-warning btn btn-xl w-full shadow-sm lg:w-1/3"
		><Icon class="mr-2" data={plus} /> Crear cliente</a
	>
	<a href="/customers/search" class="variant-filled-surface btn btn-xl w-full shadow-sm lg:w-1/3"
		><Icon class="mr-2" data={search} /> Buscar cliente</a
	>
	<a href="/orders/search" class="variant-filled btn btn-xl w-full shadow-sm lg:w-1/3"
		><Icon class="mr-2" data={faBox} /> Consultar Pedido</a
	>
</div>

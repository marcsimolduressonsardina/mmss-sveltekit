<script lang="ts">
	import { faQrcode } from '@fortawesome/free-solid-svg-icons/faQrcode';
	import { faImage } from '@fortawesome/free-solid-svg-icons/faImage';
	import { faList } from '@fortawesome/free-solid-svg-icons/faList';
	import Icon from 'svelte-awesome';
	import plus from 'svelte-awesome/icons/plus';
	import search from 'svelte-awesome/icons/search';
</script>

<div
	class="flex w-full flex-col place-content-center items-center justify-center gap-2 p-4 md:grid md:grid-cols-2 lg:grid-cols-3"
>
	<a href="/customers/new" class="variant-filled-warning btn btn-xl w-full shadow-sm">
		<Icon class="mr-2" data={plus} /> Crear cliente
	</a>
	<a href="/customers/search" class="variant-filled-surface btn btn-xl w-full shadow-sm">
		<Icon class="mr-2" data={search} /> Buscar cliente
	</a>
	<a href="/orders/scan" class="variant-filled btn btn-xl w-full shadow-sm">
		<Icon class="mr-2" data={faQrcode} /> Escanear Pedido
	</a>
	<a href="/orders/list" class="variant-filled-secondary btn btn-xl w-full shadow-sm">
		<Icon class="mr-2" data={faList} /> Listado de pedidos
	</a>
	<a href="/orders/new" class="variant-filled-primary btn btn-xl w-full shadow-sm">
		<Icon class="mr-2" data={faImage} /> Crear presupuesto
	</a>
</div>

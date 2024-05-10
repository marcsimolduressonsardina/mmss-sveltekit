<script lang="ts">
	import { faList } from '@fortawesome/free-solid-svg-icons/faList';
	import { faMoneyBill } from '@fortawesome/free-solid-svg-icons/faMoneyBill';
	import { faCropSimple } from '@fortawesome/free-solid-svg-icons/faCropSimple';
	import Icon from 'svelte-awesome';
</script>

<div class="px-2 pt-1 text-xl font-semibold">Precios</div>

<div
	class="flex w-full flex-col place-content-center items-center justify-center space-y-2 p-4 lg:flex-row lg:space-x-2 lg:space-y-0"
>
	<a href="/prices/molds" class="variant-filled-warning btn btn-xl w-full shadow-sm"
		><Icon class="mr-2" data={faCropSimple} /> Cargar molduras</a
	>
	<a href="/prices/new" class="variant-filled-surface btn btn-xl w-full shadow-sm"
		><Icon class="mr-2" data={faMoneyBill} /> Nuevo precio</a
	>

	<a href="/prices/list" class="variant-filled btn btn-xl w-full shadow-sm"
		><Icon class="mr-2" data={faList} />Lista de precios</a
	>
</div>

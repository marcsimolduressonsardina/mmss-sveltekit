<script lang="ts">
	import { OrderUtilites } from '$lib/shared/order.utilities';
	import { PricingType } from '$lib/type/pricing.type';
	import { DateTime } from 'luxon';
	import type { PageData } from './$types';
	import Qr from '$lib/components/Qr.svelte';
	export let data: PageData;
	const order = data.order!;
	const calculatedItem = data.calculatedItem!;
	const qrUrl = data.qrHost + '/orders/' + order.id;

	const others = [
		...OrderUtilites.getOrderElementByPricingType(order, calculatedItem, PricingType.FABRIC),
		...OrderUtilites.getOrderElementByPricingType(order, calculatedItem, PricingType.LABOUR),
		...OrderUtilites.getOrderElementByPricingType(order, calculatedItem, PricingType.OTHER),
		...OrderUtilites.getExtras(calculatedItem)
	];

	export const weekDayMap: Record<string, string> = {
		['Mon']: 'Lun',
		['Tue']: 'Mar',
		['Wed']: 'Mie',
		['Thu']: 'Jue',
		['Fri']: 'Vie',
		['Sat']: 'Sab',
		['Sun']: 'Dom'
	};

	const enWeekDay = DateTime.fromJSDate(order.item.deliveryDate).weekdayShort as string;
	const esWeekDay = weekDayMap[enWeekDay];
</script>

<main>
	<table border="1" cellpadding="4" style="">
		<tr>
			<td colspan="1" class="center-text">
				<Qr size={85} {qrUrl}></Qr><br />
			</td>
			<td colspan="3" class="center-text">
				Pedido: {OrderUtilites.getOrderPublicId(order)}<br />
				<span>Dependiente: Juan Carlos</span><br />
				<span>Fecha: {new Date(order.createdAt).toLocaleString()}</span>
			</td>
		</tr>

		<tr>
			<th colspan="2">Moldura</th>
			<th colspan="2">PP / Fondo</th>
		</tr>
		<tr>
			<td colspan="2">
				{#each OrderUtilites.getOrderMolds(order) as mold}
					{mold}<br />
				{/each}
			</td>
			<td colspan="2">
				{#each OrderUtilites.getOrderElementByPricingType(order, calculatedItem, PricingType.PP) as pp}
					{pp}<br />
				{/each}

				{#if order.item.ppDimensions}
					AR: {order.item.ppDimensions.up}, AB: {order.item.ppDimensions.down}, D: {order.item
						.ppDimensions.right}, I: {order.item.ppDimensions.left}
				{:else if order.item.pp > 0}
					Simétrico: {order.item.pp} cm
				{/if}
			</td>
		</tr>
		<tr>
			<th>Medidas</th>
			<th>Uds</th>
			<th>Cristal</th>
			<th>Trasera</th>
		</tr>
		<tr>
			<td>
				Obra: {`${order.item.height}x${order.item.width} cm`} <br />
				Trabajo: {OrderUtilites.getWorkingDimensions(order)}
			</td>
			<td class="center-text"> {order.item.quantity} </td>
			<td>
				{#each OrderUtilites.getOrderElementByPricingType(order, calculatedItem, PricingType.GLASS) as glass}
					{glass}<br />
				{/each}
			</td>
			<td>
				{#each OrderUtilites.getOrderElementByPricingType(order, calculatedItem, PricingType.BACK) as back}
					{back}<br />
				{/each}
			</td>
		</tr>
		{#if others.length > 0}
			<tr>
				<th colspan="4"> Otros </th>
			</tr>
			<tr>
				<td colspan="4">
					{#each others as f}
						{f}<br />
					{/each}
				</td>
			</tr>
		{/if}
		<tr>
			<th colspan="4"> Descripción </th>
		</tr>
		<tr>
			<td colspan="4">{order.item.description}</td>
		</tr>
		<tr>
			<th colspan="4"> Observaciones </th>
		</tr>
		<tr>
			<td colspan="4">
				{#if order.item.observations.length > 0}
					{order.item.observations}<br />
				{/if}
				{#each order.item.predefinedObservations as p}
					- {p}<br />
				{/each}
			</td>
		</tr>
		<tr>
			<th colspan="1"> Recogida </th>
			<th colspan="2"> Cliente </th>
			<th colspan="1"> Teléfono </th>
		</tr>
		<tr>
			<td colspan="1" class="center-text">
				{esWeekDay}
				{DateTime.fromJSDate(order.item.deliveryDate).toFormat('dd/MM/yyyy')}
			</td>
			<td colspan="2" class="center-text"> {order.customer.name} </td>
			<td colspan="1" class="center-text"> {order.customer.phone} </td>
		</tr>
	</table>
</main>

<style>
	table {
		font-family: monospace;
		font-size: smaller;
		border-collapse: collapse;
	}

	th {
		background-color: black;
		color: white;
	}

	.center-text {
		text-align: center;
	}
</style>

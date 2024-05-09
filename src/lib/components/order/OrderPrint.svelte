<script lang="ts">
	import { OrderUtilites } from '$lib/shared/order.utilities';
	import { PricingType } from '$lib/type/pricing.type';
	import { DateTime } from 'luxon';
	import Qr from '$lib/components/Qr.svelte';
	import mmlogo from '$lib/assets/mmlogo.png';
	import type { CalculatedItem, Order } from '$lib/type/api.type';
	import { OrderStatus } from '$lib/type/order.type';
	import { CalculatedItemUtilities } from '$lib/shared/calculated-item.utilites';

	export let order: Order;
	export let calculatedItem: CalculatedItem;
	export let isForCustomer: boolean;

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
	const esWeekDay = weekDayMap[enWeekDay] ?? enWeekDay;

	const statusInfo: string[] = [];

	if (order.status === OrderStatus.PICKED_UP) {
		statusInfo.push('ENTREGADO');
	}

	if (order.amountPayed === calculatedItem.total) {
		statusInfo.push('PAGADO');
	}

	const extraColForDiscount = calculatedItem.discount > 0 ? 1 : 0;
</script>

<main>
	{#if isForCustomer}
		<div class="customer-title">
			<span>Copia para el cliente</span>
		</div>
	{/if}
	<table border="1" cellpadding="4" style="">
		<tr>
			<td colspan="1" class="center-text">
				<Qr size={85} qrData={order.id}></Qr><br />
			</td>
			<td colspan={3 + extraColForDiscount} class="center-text">
				{#if isForCustomer}
					<img class="logo" src={mmlogo} alt="logo" /><br />
				{/if}
				Pedido: {OrderUtilites.getOrderPublicId(order)}<br />
				<span>Dependiente: {order.userName}</span><br />
				<span>Fecha: {DateTime.fromJSDate(order.createdAt).toFormat('dd/MM/yyyy HH:mm')}</span>
			</td>
		</tr>

		<tr>
			<th colspan="2">Moldura</th>
			<th colspan={2 + extraColForDiscount}>PP / Fondo</th>
		</tr>
		<tr>
			<td colspan="2">
				{#each OrderUtilites.getOrderMolds(order) as mold}
					{mold}<br />
				{/each}
			</td>
			<td colspan={2 + extraColForDiscount}>
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
			<th colspan={1 + extraColForDiscount}>Medidas</th>
			<th>Uds</th>
			<th>Cristal</th>
			<th>Trasera</th>
		</tr>
		<tr>
			<td colspan={1 + extraColForDiscount}>
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
				<th colspan={4 + extraColForDiscount}> Otros </th>
			</tr>
			<tr>
				<td colspan={4 + extraColForDiscount}>
					{#each others as f}
						{f}<br />
					{/each}
				</td>
			</tr>
		{/if}
		<tr>
			<th colspan={4 + extraColForDiscount}> Descripción </th>
		</tr>
		<tr>
			<td colspan={4 + extraColForDiscount}>{order.item.description}</td>
		</tr>
		<tr>
			<th colspan={4 + extraColForDiscount}> Observaciones </th>
		</tr>
		<tr>
			<td colspan={4 + extraColForDiscount}>
				{#if order.item.observations.length > 0}
					{order.item.observations}<br />
				{/if}
				{#each order.item.predefinedObservations as p}
					- {p}<br />
				{/each}
			</td>
		</tr>
		<tr>
			<th>Precio ud</th>
			{#if calculatedItem.discount > 0}
				<th></th>
			{/if}
			<th>Uds</th>
			<th>A cuenta</th>
			<th>Total</th>
		</tr>
		<tr>
			<td class="center-text">
				{CalculatedItemUtilities.getUnitPriceWithoutDiscount(calculatedItem)} €
			</td>
			{#if calculatedItem.discount > 0}
				<td class="center-text">
					{CalculatedItemUtilities.getUnitPriceWithDiscount(calculatedItem)} €
				</td>
			{/if}
			<td class="center-text"> {order.item.quantity} </td>
			<td class="center-text"> {order.amountPayed.toFixed(2)} €</td>
			<td class="center-text"> {calculatedItem.total.toFixed(2)} €</td>
		</tr>
		<tr>
			<th colspan="1"> Recogida </th>
			<th colspan={2 + extraColForDiscount}> Cliente </th>
			<th colspan="1"> Teléfono </th>
		</tr>
		<tr>
			<td colspan="1" class="center-text">
				{esWeekDay}
				{DateTime.fromJSDate(order.item.deliveryDate).toFormat('dd/MM/yyyy')}
			</td>
			<td colspan={2 + extraColForDiscount} class="center-text"> {order.customer.name} </td>
			<td colspan="1" class="center-text"> {order.customer.phone} </td>
		</tr>

		{#if statusInfo.length > 0}
			<tr>
				<td colspan={4 + extraColForDiscount} class="center-text status-info">
					{statusInfo.join(' | ')}
				</td>
			</tr>
		{/if}
	</table>
</main>

<style>
	.customer-title {
		font-family: sans-serif;
		padding-bottom: 5px;
	}

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

	.logo {
		height: 55px;
	}

	.status-info {
		font-weight: bold;
	}
</style>

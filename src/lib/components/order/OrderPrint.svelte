<script lang="ts">
	import { onMount } from 'svelte';
	import { OrderUtilites } from '$lib/shared/order.utilities';
	import { PricingType } from '$lib/type/pricing.type';
	import { DateTime } from 'luxon';
	import Qr from '$lib/components/Qr.svelte';
	import type { CalculatedItem, Order } from '$lib/type/api.type';
	import { OrderStatus } from '$lib/type/order.type';
	import { CalculatedItemUtilities } from '$lib/shared/calculated-item.utilites';

	export let order: Order;
	export let calculatedItem: CalculatedItem;
	export let print: boolean = false;

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
	} else if (order.amountPayed === 0) {
		statusInfo.push('PENDIENTE DE PAGO');
	} else {
		statusInfo.push(
			`PENDIENTE DE PAGO (${(calculatedItem.total - order.amountPayed).toFixed(2)} €)`
		);
	}

	const extraColForDiscount = calculatedItem.discount > 0 ? 1 : 0;

	function groupInPairs(arr: string[]): string[][] {
		const result: string[][] = [];

		for (let i = 0; i < arr.length; i += 2) {
			const pair: string[] = [arr[i], arr[i + 1] || ''];
			result.push(pair);
		}

		return result;
	}

	const bullCharacter = '\u2022';

	onMount(() => {
		if (print) {
			setTimeout(() => {
				window.print();
			}, 750);
		}
	});
</script>

<main>
	<table border="1" cellpadding="4" style="">
		<tr>
			<td colspan="1" class="center-text">
				<Qr size={85} qrData={order.id}></Qr>
				<div class="customer-text">
					<p class="customer-bottom">{OrderUtilites.getOrderPublicId(order)}</p>
				</div>
			</td>
			<td colspan={3 + extraColForDiscount} class="center-text">
				<img
					class="logo"
					src="https://marcsimoldures.com/wp-content/uploads/2017/02/MMlogo111.png"
					alt="logo"
				/>
				<div class="customer-text">
					<p class="customer-bottom">
						Polígono de Son Rossinyol - Gremi Hortolans 19 - +34 971666920
					</p>
					<p class="customer-bottom">www.marcsimoldures.com - mmss@marcsimoldures.com</p>
					<p class="customer-bottom">Horario de lunes a viernes de 09:00 a 18:00,</p>
					<p class="customer-bottom">sábados de 09:30 a 13:15</p>
				</div>
			</td>
		</tr>

		<tr>
			<th colspan="2">Dependiente</th>
			<th colspan={1 + extraColForDiscount}>Fecha</th>
			<th>Hora</th>
		</tr>
		<tr>
			<td colspan="2">{order.user.name}</td>
			<td class="center-text" colspan={1 + extraColForDiscount}>
				{DateTime.fromJSDate(order.createdAt).toFormat('dd/MM/yyyy')}
			</td>
			<td class="center-text">{DateTime.fromJSDate(order.createdAt).toFormat('HH:mm')}</td>
		</tr>

		<tr>
			<th>Moldura</th>
			<th>Cristal</th>
			<th>Trasera</th>
			<th colspan={1 + extraColForDiscount}>PP / Fondo</th>
		</tr>
		<tr>
			<td>
				{#each OrderUtilites.getOrderMolds(order) as mold}
					{mold}<br />
				{/each}
			</td>
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
			<td colspan={1 + extraColForDiscount}>
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
			<th colspan={3 + extraColForDiscount}>Descripción</th>
		</tr>
		<tr>
			<td>
				Obra: {`${order.item.height}x${order.item.width} cm`} <br />
				Trabajo: {OrderUtilites.getWorkingDimensions(order)}
				{#if order.item.exteriorHeight || order.item.exteriorWidth}
					<br />
					Marco exterior: {`${order.item.exteriorHeight}x${order.item.exteriorWidth} cm`}
				{/if}
			</td>
			<td class="center-text"> {order.item.quantity} </td>
			<td colspan={3 + extraColForDiscount}>{order.item.description}</td>
		</tr>
		{#if others.length > 0}
			<tr>
				<th colspan={4 + extraColForDiscount}> Otros </th>
			</tr>
			<tr>
				<td colspan={4 + extraColForDiscount}>
					<table class="internal-table">
						{#each groupInPairs(others) as pair}
							<tr>
								<td> {bullCharacter} {pair[0]} </td>
								<td>
									{#if pair[1].length > 0}
										{bullCharacter} {pair[1]}
									{/if}
								</td>
							</tr>
						{/each}
					</table>
				</td>
			</tr>
		{/if}
		<tr>
			<th colspan={4 + extraColForDiscount}> Observaciones </th>
		</tr>
		<tr>
			<td colspan={4 + extraColForDiscount}>
				{order.item.observations}
				<table class="internal-table">
					{#each groupInPairs(order.item.predefinedObservations) as pair}
						<tr>
							<td> {bullCharacter} {pair[0]} </td>
							<td>
								{#if pair[1].length > 0}
									{bullCharacter} {pair[1]}
								{/if}
							</td>
						</tr>
					{/each}
				</table>
			</td>
		</tr>
		<tr>
			<th>Precio ud</th>
			{#if calculatedItem.discount > 0}
				<th></th>
			{/if}
			<th>Uds</th>
			<th>A cuenta</th>
			<th>Total {order.hasArrow ? '⬇︎' : ''}</th>
		</tr>
		<tr>
			<td class="center-text">
				{CalculatedItemUtilities.getUnitPriceWithoutDiscount(calculatedItem)} €
			</td>
			{#if calculatedItem.discount > 0}
				<td class="center-text">
					{OrderUtilites.getDiscountRepresentation(calculatedItem.discount)}
				</td>
			{/if}
			<td class="center-text"> {order.item.quantity} </td>
			<td class="center-text"> {order.amountPayed.toFixed(2)} €</td>
			<td class="center-text">{calculatedItem.total.toFixed(2)} €</td>
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
	<div class="customer-text">
		<p class="customer-bottom">
			Una vez pasados <strong>15 días desde la fecha estipulada de entrega</strong>, la empresa
			<strong>no se hará cargo del material.</strong>
		</p>
		<p class="customer-bottom">
			<strong>Sin el justificante no se hará entrega del material.</strong>
		</p>
	</div>
</main>

<style>
	@media print {
		table {
			width: 100%;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}

		@page {
			size: A5 portrait;
			margin: 0;
		}

		body {
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}
	}

	.customer-text {
		font-family: sans-serif;
		font-size: x-small;
	}

	.customer-bottom {
		margin: 0;
		text-align: center;
	}

	table {
		font-family: monospace;
		font-size: smaller;
		border-collapse: collapse;
		margin: 0 auto;
	}

	.internal-table {
		font-size: 11px;
		width: 100%;
	}

	th {
		background-color: darkgrey;
		color: white;
		font-size: xx-small;
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

<script lang="ts">
	import Box from '$lib/components/Box.svelte';
	import { CalculatedItemUtilities } from '$lib/shared/calculated-item.utilites';
	import { OrderUtilites } from '$lib/shared/order.utilities';
	import type { Order, CalculatedItem } from '$lib/type/api.type';

	export let order: Order;
	export let calculatedItem: CalculatedItem;
</script>

<Box title="Elementos">
	{#if calculatedItem}
		<div class="text-md space-y-2 text-gray-700">
			{#each CalculatedItemUtilities.sortByPricingType(OrderUtilites.addPricingTypeToCalculatedParts(order.item.partsToCalculate, calculatedItem.parts)) as part}
				<div class="flex justify-between">
					<span>- {part.description}</span>
					<div>
						<span class="rounded-lg bg-gray-200 px-2 py-1 text-gray-700"
							>{part.price.toFixed(2)}€</span
						>
						{#if part.quantity > 1}
							<span class="ml-2 rounded-lg bg-gray-200 px-2 py-1 text-gray-700"
								>x{part.quantity}</span
							>
						{/if}
					</div>
				</div>
			{/each}

			{#if calculatedItem.quantity > 1}
				<div class="flex justify-between">
					<span>Unidades:</span>
					<span class="rounded-lg bg-gray-200 px-2 py-1 text-gray-700">{order.item.quantity}</span>
				</div>
				<div class="flex justify-between">
					<span>Precio unitario:</span>
					<span class="rounded-lg bg-gray-200 px-2 py-1 text-gray-700">
						{CalculatedItemUtilities.getUnitPriceWithoutDiscount(calculatedItem)} €
					</span>
				</div>
				{#if calculatedItem.discount > 0}
					<div class="flex justify-between">
						<span>Precio unitario con descuento:</span>
						<span class="rounded-lg bg-gray-200 px-2 py-1 text-gray-700">
							{CalculatedItemUtilities.getUnitPriceWithDiscount(calculatedItem)} €
						</span>
					</div>
				{/if}
			{/if}

			{#if calculatedItem.discount > 0}
				<div class="flex justify-between">
					<span>Total sin descuento:</span>
					<span class="rounded-lg bg-gray-200 px-2 py-1 text-gray-700">
						{CalculatedItemUtilities.getTotalWithoutDiscount(calculatedItem).toFixed(2)} €
					</span>
				</div>
				<div class="flex justify-between">
					<span>Descuento:</span>
					<span class="rounded-lg bg-gray-200 px-2 py-1 text-gray-700"
						>{calculatedItem.discount}%</span
					>
				</div>
			{/if}
		</div>
	{/if}
</Box>

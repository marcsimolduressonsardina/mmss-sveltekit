<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { dateProxy, superForm } from 'sveltekit-superforms';

	import Icon from 'svelte-awesome';
	import plus from 'svelte-awesome/icons/plus';
	import minus from 'svelte-awesome/icons/minus';
	import { faClipboardList } from '@fortawesome/free-solid-svg-icons/faClipboardList';
	import { faCircleCheck } from '@fortawesome/free-solid-svg-icons/faCircleCheck';
	import { faEdit } from '@fortawesome/free-solid-svg-icons/faEdit';

	import type {
		CalculatedItemPart,
		ListPrice,
		ListPriceForm,
		PPDimensions,
		PreCalculatedItemPart,
		PreCalculatedItemPartRequest
	} from '$lib/type/api.type';

	import {
		CalculatedItemUtilities,
		cornersId,
		otherExtraId
	} from '$lib/shared/calculated-item.utilites';
	import { PricingType } from '$lib/type/pricing.type';
	import CartItem from '$lib/components/item/CartItem.svelte';
	import PricingSelectorSection from '$lib/components/item/PricingSelectorSection.svelte';
	import PricingSelectorWithQuantitySection from '$lib/components/item/PricingSelectorWithQuantitySection.svelte';
	import AutocompleteSection from '$lib/components/item/AutocompleteSection.svelte';
	import Spacer from '$lib/components/item/Spacer.svelte';
	import ChipSet from '$lib/components/item/ChipSet.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { PricingUtilites, fabricDefaultPricing, fabricIds } from '$lib/shared/pricing.utilites';
	import {
		ACCIONES_NEUTRES_COLORS,
		BUTTON_DEFAULT_CLASSES,
		PEDIDOS_COLORS,
		PRESUPUESTOS_COLORS
	} from '$lib/ui/ui.constants';
	import { onMount } from 'svelte';
	import type { OrderCreationFormData } from '$lib/server/shared/order/order-creation.utilities';
	import { DimensionsType, OrderStatus } from '$lib/type/order.type';
	import Box from '../Box.svelte';
	import { faRectangleList } from '@fortawesome/free-solid-svg-icons';

	export let data: OrderCreationFormData;

	type TempParts = { pre: PreCalculatedItemPart; post: CalculatedItemPart }[];

	const toastStore = getToastStore();
	const { form, errors, enhance, submitting } = superForm(data.form, {
		dataType: 'json'
	});
	const proxyDate = dateProxy(form, 'deliveryDate', { format: 'date' });

	$form.height = ($form.height === 0 ? '' : $form.height) as unknown as number;
	$form.width = ($form.width === 0 ? '' : $form.width) as unknown as number;
	$form.pp = ($form.pp === 0 ? '' : $form.pp) as unknown as number;

	let total = 0.0;
	let totalPerUnit = 0.0;
	let totalPerUnitWithoutDiscount = 0.0;
	let totalPerUnitDiscount = 0.0;
	let totalDiscount = 0.0;
	let totalWithoutDiscount = 0.0;
	let predefinedObservations: string[] =
		$form.predefinedObservations.length > 0 ? $form.predefinedObservations : [];
	let partsToCalculate: PreCalculatedItemPart[] =
		$form.partsToCalculate.length > 0
			? $form.partsToCalculate.map((p) => ({ ...p, type: p.type as PricingType }))
			: [];

	let partsToCalulatePreview: TempParts = [];
	let extraParts: CalculatedItemPart[] =
		$form.extraParts.length > 0
			? $form.extraParts
			: [
					{
						description: 'Cantoneras',
						price: 2.5,
						quantity: 1,
						priceId: cornersId,
						discountAllowed: true
					}
				];

	// Fabric vars
	let fabricPrices: ListPriceForm[] = [fabricDefaultPricing];

	// PP vars
	let asymetricPP = $form.ppDimensions != null;
	let upPP: number | string = $form.ppDimensions == null ? '' : $form.ppDimensions.up;
	let downPP: number | string = $form.ppDimensions == null ? '' : $form.ppDimensions.down;
	let leftPP: number | string = $form.ppDimensions == null ? '' : $form.ppDimensions.left;
	let rightPP: number | string = $form.ppDimensions == null ? '' : $form.ppDimensions.right;
	$form.ppDimensions = $form.ppDimensions != null ? $form.ppDimensions : undefined;

	// Size vars
	let totalHeightBox = 0;
	let totalWidthBox = 0;

	const noObservationsLabel = 'No hay observaciones';
	const defaultObservations = [
		noObservationsLabel,
		'Sabe que puede ondular',
		'No pegar',
		'Muy delicado',
		'La obra puede ser dañada por su manipulación',
		'El cliente autoriza a publicar su obra en redes'
	];

	let otherNameElementInput: HTMLInputElement;
	let otherPriceElementInput: HTMLInputElement;
	let otherQuantityElementInput: HTMLSelectElement;

	$form.extraParts = extraParts;
	$form.partsToCalculate = partsToCalculate;
	$form.predefinedObservations = predefinedObservations;

	async function handleDimensionsChangeEvent() {
		if (partsToCalulatePreview.length > 0) {
			toastStore.trigger({
				message: `Las dimensiones han cambiado, recalculando el precio...`,
				background: 'variant-filled'
			});

			const promises = partsToCalculate.map((p) => getPartToCalculateWihtPre(p));
			const parts = (await Promise.all(promises)).filter((p) => p != null) as {
				pre: PreCalculatedItemPart;
				post: CalculatedItemPart;
			}[];

			const validatedParts = parts.map((p) => p.pre);
			partsToCalculate = validatedParts;
			$form.partsToCalculate = partsToCalculate;
			partsToCalulatePreview = parts;
			toastStore.trigger({
				message: `Precios actualizados`,
				background: 'variant-filled'
			});
		}
	}

	async function getPartToCalculateWihtPre(
		partToCalculate: PreCalculatedItemPart
	): Promise<{ pre: PreCalculatedItemPart; post: CalculatedItemPart } | undefined> {
		const part = await getPartToCalculate(partToCalculate);
		if (!part) {
			return;
		}

		return { pre: partToCalculate, post: part };
	}

	function addObservation(observation: string) {
		predefinedObservations.push(observation);
		predefinedObservations = [...predefinedObservations];
		$form.predefinedObservations = predefinedObservations;
	}

	function addDescription(description: string) {
		$form.description = description;
	}

	function removeObservation(observation: string) {
		predefinedObservations = predefinedObservations.filter((o) => o !== observation);
		predefinedObservations = [...predefinedObservations];
		$form.predefinedObservations = predefinedObservations;
	}

	function extractNumber(input: string | number): number {
		if (typeof input === 'number') {
			return input;
		}

		const parsedNumber = Number(input);
		if (isNaN(parsedNumber)) {
			return 0;
		}

		return parsedNumber;
	}

	function getOrderDimensions() {
		const width = $form.width;
		const height = $form.height;

		if (!asymetricPP) {
			return CalculatedItemUtilities.getOrderDimensions(width, height, $form.pp);
		} else {
			return CalculatedItemUtilities.getOrderDimensions(width, height, 0, {
				up: extractNumber(upPP),
				down: extractNumber(downPP),
				left: extractNumber(leftPP),
				right: extractNumber(rightPP)
			});
		}
	}

	function deletePrecalculatedPreview(part: {
		pre: PreCalculatedItemPart;
		post: CalculatedItemPart;
	}) {
		partsToCalulatePreview = partsToCalulatePreview.filter((p) => p !== part);
		partsToCalculate = partsToCalculate.filter((p) => p !== part.pre);
		$form.partsToCalculate = partsToCalculate;
	}

	function deleteExtraPart(part: CalculatedItemPart) {
		extraParts = extraParts.filter((p) => p !== part);
		extraParts = [...extraParts];
		$form.extraParts = extraParts;
	}

	async function addFromPricingSelector(
		pricingType: PricingType,
		value?: string,
		moldId?: string,
		extraInfo?: string
	) {
		if (value == null) {
			return;
		}

		const partToCalculate = {
			id: value,
			quantity: 1,
			type: pricingType,
			moldId,
			extraInfo
		};

		await processPartToCalculate(partToCalculate);
	}

	async function processPartToCalculate(partToCalculate: PreCalculatedItemPart) {
		const part = await getPartToCalculate(partToCalculate);
		if (!part) {
			return;
		}

		partsToCalulatePreview = [...partsToCalulatePreview, { pre: partToCalculate, post: part }];
		partsToCalculate = [...partsToCalculate, partToCalculate];
		$form.partsToCalculate = partsToCalculate;
	}

	async function getPartToCalculate(
		partToCalculate: PreCalculatedItemPart
	): Promise<CalculatedItemPart | undefined> {
		const orderDimensions = getOrderDimensions();
		const request: PreCalculatedItemPartRequest = {
			orderDimensions,
			partToCalculate
		};
		const response = await fetch('/api/prices', {
			method: 'POST',
			body: JSON.stringify(request),
			headers: {
				'content-type': 'application/json'
			}
		});

		if (response.status !== 200) {
			if (response.status === 500) {
				toastStore.trigger({
					message: `Error al calcular el precio. Puede ser que el precio ya no exista (${partToCalculate.id}).`,
					background: 'variant-filled-error'
				});
			}

			if (response.status === 400) {
				const errorResponse = await response.json();
				toastStore.trigger({
					message:
						errorResponse.error ?? 'Error al calcular el precio. Por favor, revise los datos.',
					background: 'variant-filled-error'
				});
			}

			return;
		}

		const part = (await response.json()) as CalculatedItemPart;
		return part;
	}

	async function addOtherElementsFromSelector(id: string, quantity: number) {
		const pricing = await data.pricing;
		await addElementWithQuantity(id, quantity, pricing.otherPrices);
	}

	async function addHangerElementsFromSelector(id: string, quantity: number) {
		const pricing = await data.pricing;
		await addElementWithQuantity(id, quantity, pricing.hangerPrices);
	}

	async function addElementWithQuantity(id: string, quantity: number, list: ListPrice[]) {
		const selected = list.find((price) => price.id === id);
		if (selected) {
			const partToCalculate = {
				id: selected.id,
				quantity: quantity,
				type: selected.type
			};

			await processPartToCalculate(partToCalculate);
		}
	}

	function addOtherElement() {
		const nameElement = otherNameElementInput;
		const name = nameElement ? nameElement.value : null;
		const priceElement = otherPriceElementInput;
		const price = priceElement ? Number(priceElement.value) : null;
		const quantityElement = otherQuantityElementInput;
		const quantity = quantityElement ? Number(quantityElement.value) : null;

		if (name && price && quantity) {
			const part = {
				description: name,
				price,
				quantity,
				priceId: otherExtraId,
				discountAllowed: true
			};
			extraParts = [part, ...extraParts];
			$form.extraParts = extraParts;
		}

		// Reset the inputs
		if (nameElement) {
			nameElement.value = '';
		}
		if (priceElement) {
			priceElement.value = '';
		}
		if (quantityElement) {
			quantityElement.value = '1';
		}
	}

	function updateTotal(
		parts: TempParts,
		eParts: CalculatedItemPart[],
		discount: number,
		quantity: number
	) {
		const allParts = [...eParts, ...parts.map((p) => p.post)];
		totalPerUnitWithoutDiscount = CalculatedItemUtilities.calculatePartsCost(allParts, false);
		totalPerUnit = CalculatedItemUtilities.calculatePartsCost(allParts, true, discount);
		totalPerUnitDiscount = totalPerUnitWithoutDiscount - totalPerUnit;
		totalWithoutDiscount = totalPerUnitWithoutDiscount * quantity;
		total = totalPerUnit * quantity;
		totalDiscount = totalPerUnitDiscount * quantity;
	}

	function updatePP(aPP: boolean, up: number, down: number, left: number, right: number) {
		if (aPP) {
			$form.pp = 0;
			$form.ppDimensions = {
				up,
				down,
				left,
				right
			};
		} else {
			$form.ppDimensions = undefined;
			upPP = '';
			downPP = '';
			leftPP = '';
			rightPP = '';
		}
	}

	function updateTotalSizes(
		width: number,
		height: number,
		pp: number,
		ppDimensions?: PPDimensions
	) {
		const { totalWidth, totalHeight } = CalculatedItemUtilities.getTotalDimensions(
			isNaN(width) ? 0 : width,
			isNaN(height) ? 0 : height,
			isNaN(pp) ? 0 : pp,
			ppDimensions
		);

		totalHeightBox = totalHeight;
		totalWidthBox = totalWidth;
	}

	function updateFabricPrices(moldPartsToCalculate: TempParts) {
		const newPrices = [fabricDefaultPricing];
		const orderDimensions = getOrderDimensions();
		const sortedMolds = moldPartsToCalculate.sort();
		sortedMolds.forEach((t) => {
			[fabricIds.long, fabricIds.short].forEach((id) => {
				newPrices.push(
					PricingUtilites.generateCrossbarPricing(
						id,
						0,
						t.post.description,
						PricingUtilites.getFabricCrossbarDimension(
							id,
							orderDimensions.totalHeight,
							orderDimensions.totalWidth
						),
						t.pre.id
					)
				);
			});
		});

		fabricPrices = newPrices;
	}

	function calculateMissingLabels(
		pp: boolean,
		hanger: boolean,
		transport: boolean,
		back: boolean,
		labour: boolean,
		other: boolean,
		mold: boolean,
		glass: boolean,
		observations: boolean,
		description: boolean,
		discount: boolean,
		exteriorDimensions: boolean
	) {
		const parts = [];
		if (!pp) {
			parts.push('Falta PP');
		}

		if (!hanger) {
			parts.push('Falta colgadores');
		}

		if (!transport) {
			parts.push('Falta transporte');
		}

		if (!labour) {
			parts.push('Faltan montajes');
		}

		if (!other) {
			parts.push('Faltan suministros');
		}

		if (!back) {
			parts.push('Falta trasera');
		}

		if (!mold) {
			parts.push('Falta moldura / marco');
		}

		if (!glass) {
			parts.push('Falta cristal');
		}

		if (!observations) {
			parts.push('Faltan observaciones');
		}

		if (!description) {
			parts.push('Falta descripción');
		}

		if (!discount) {
			parts.push('Falta descuento');
		}

		if (!exteriorDimensions) {
			parts.push('Faltan medidas exteriores');
		}

		return parts;
	}

	// Added vars

	$: exteriorDimensions = $form.dimenstionsType === DimensionsType.EXTERIOR;
	$: addedOther = partsToCalulatePreview.filter((p) => p.pre.type === PricingType.OTHER).length > 0;
	$: addedPP = partsToCalulatePreview.filter((p) => p.pre.type === PricingType.PP).length > 0;
	$: addedHanger =
		partsToCalulatePreview.filter((p) => p.pre.type === PricingType.HANGER).length > 0;
	$: addedTransport =
		partsToCalulatePreview.filter((p) => p.pre.type === PricingType.TRANSPORT).length > 0;
	$: addedBack = partsToCalulatePreview.filter((p) => p.pre.type === PricingType.BACK).length > 0;
	$: addedLabour =
		partsToCalulatePreview.filter((p) =>
			[PricingType.FABRIC, PricingType.LABOUR].includes(p.pre.type)
		).length > 0;
	$: addedMold = partsToCalulatePreview.filter((p) => p.pre.type === PricingType.MOLD).length > 0;
	$: addedGlass = partsToCalulatePreview.filter((p) => p.pre.type === PricingType.GLASS).length > 0;
	$: addedObservations = $form.observations.length > 0 || $form.predefinedObservations.length > 0;
	$: addedDescription = $form.description.length > 0;
	$: addedDiscount = typeof $form.discount === 'number' && !isNaN($form.discount);
	$: addedExteriorDimensions =
		!exteriorDimensions || ($form.exteriorHeight != null && $form.exteriorWidth != null);
	$: descriptionChipList = $form.description.length > 0 ? [] : ['Sin obra'];
	$: missingReasons = calculateMissingLabels(
		addedPP,
		addedHanger,
		addedTransport,
		addedBack,
		addedLabour,
		addedOther,
		addedMold,
		addedGlass,
		addedObservations,
		addedDescription,
		addedDiscount,
		addedExteriorDimensions
	);

	$: {
		updatePP(
			asymetricPP,
			extractNumber(upPP),
			extractNumber(downPP),
			extractNumber(leftPP),
			extractNumber(rightPP)
		);
		updateTotalSizes(
			extractNumber($form.width),
			extractNumber($form.height),
			extractNumber($form.pp),
			$form.ppDimensions
		);
		updateFabricPrices(partsToCalulatePreview.filter((p) => p.pre.type === PricingType.MOLD));
		updateTotal(partsToCalulatePreview, extraParts, $form.discount, $form.quantity);
	}

	onMount(async () => {
		if (partsToCalculate.length > 0) {
			const promises = partsToCalculate.map((p) => getPartToCalculateWihtPre(p));
			const parts = (await Promise.all(promises)).filter((p) => p != null) as {
				pre: PreCalculatedItemPart;
				post: CalculatedItemPart;
			}[];

			const validatedParts = parts.map((p) => p.pre);
			partsToCalculate = validatedParts;
			$form.partsToCalculate = partsToCalculate;
			partsToCalulatePreview = parts;
			toastStore.trigger({
				message: `Precios actualizados`,
				background: 'variant-filled'
			});
		}
	});
</script>

<div class="px-2 pt-1 text-2xl font-semibold">
	{#if data.editing}
		Editar {#if data.editingStatus === OrderStatus.QUOTE}
			presupuesto
		{:else}
			pedido
		{/if}
	{:else}
		Nuevo Pedido / Presupuesto
	{/if}
</div>
{#if $submitting}
	<ProgressBar text={'Guardando'} />
{:else}
	{#await data.pricing}
		<ProgressBar text={'Cargando precios'} />
	{:then pricing}
		<form
			use:enhance
			method="post"
			class="flex w-full flex-col place-content-center space-y-2 px-2 lg:grid lg:grid-cols-2 lg:space-x-2"
		>
			<Spacer title={'Datos de la obra'} />

			<label class="label" for="height">
				<span>Alto (cm):</span>
				<input
					class="input {$errors.height ? 'input-error' : ''}"
					id="height"
					type="number"
					step="0.01"
					name="height"
					on:change={() => handleDimensionsChangeEvent()}
					bind:value={$form.height}
					class:input-success={$form.height > 10}
				/>
			</label>

			<label class="label" for="width">
				<span>Ancho (cm):</span>
				<input
					class="input {$errors.width ? 'input-error' : ''}"
					id="width"
					type="number"
					step="0.01"
					name="width"
					on:change={() => handleDimensionsChangeEvent()}
					bind:value={$form.width}
					class:input-success={$form.width > 10}
				/>
			</label>

			<PricingSelectorSection
				sectionTitle={'PP / Fondo'}
				label={'Tipo'}
				priorityFirst={false}
				prices={pricing.ppPrices}
				addValue={addFromPricingSelector}
				showExtraInfo={true}
				added={addedPP}
			/>

			<label class="label" for="pp"
				><span>Medida PP (cm):</span>
				<input
					class="input {$errors.pp ? 'input-error' : ''}"
					type="number"
					step="0.01"
					min="0.00"
					name="pp"
					on:change={() => handleDimensionsChangeEvent()}
					bind:value={$form.pp}
					disabled={asymetricPP}
					class:input-success={$form.pp > 0}
				/>
			</label>

			<label class="label flex items-center space-x-2" for="ppAsymetric">
				<input
					class="checkbox"
					type="checkbox"
					bind:checked={asymetricPP}
					on:change={() => handleDimensionsChangeEvent()}
				/>
				<p>PP Asimétrico</p>
			</label>

			{#if asymetricPP}
				<Spacer title={'Medidas PP (cm)'} />

				<label class="label" for="upPP">
					<span>Arriba:</span>
					<input
						class="input"
						id="upPP"
						type="number"
						step="0.01"
						name="upPP"
						on:change={() => handleDimensionsChangeEvent()}
						bind:value={upPP}
						class:input-success={extractNumber(upPP) > 0}
					/>
				</label>

				<label class="label" for="downPP">
					<span>Abajo:</span>
					<input
						class="input"
						id="downPP"
						type="number"
						step="0.01"
						name="downPP"
						on:change={() => handleDimensionsChangeEvent()}
						bind:value={downPP}
						class:input-success={extractNumber(downPP) > 0}
					/>
				</label>

				<label class="label" for="leftPP">
					<span>Izquierda:</span>
					<input
						class="input"
						id="leftPP"
						type="number"
						step="0.01"
						name="leftPP"
						on:change={() => handleDimensionsChangeEvent()}
						bind:value={leftPP}
						class:input-success={extractNumber(leftPP) > 0}
					/>
				</label>

				<label class="label" for="rightPP">
					<span>Derecha:</span>
					<input
						class="input"
						id="rightPP"
						type="number"
						step="0.01"
						name="rightPP"
						on:change={() => handleDimensionsChangeEvent()}
						bind:value={rightPP}
						class:input-success={extractNumber(rightPP) > 0}
					/>
				</label>
			{/if}

			<dl class="list-dl lg:col-span-2">
				{#each partsToCalulatePreview.filter((p) => p.pre.type === PricingType.PP) as part}
					<CartItem
						part={part.post}
						partToDelete={part}
						deleteExtraPart={deletePrecalculatedPreview}
					/>
				{/each}
			</dl>

			<Spacer title={'Medidas de trabajo'} />

			<div class="grid grid-cols-1 lg:col-span-2">
				<div class="rounded-md border-2 border-gray-300 p-4">
					<p class="text-center text-xl text-gray-600">
						Alto: {totalHeightBox}cm | Ancho: {totalWidthBox}cm
					</p>
				</div>
			</div>

			<div class="col-span-2 flex flex-row justify-between space-x-2">
				<label class="flex items-center space-x-2">
					<input
						class="radio"
						type="radio"
						checked
						name="radio-direct"
						bind:group={$form.dimenstionsType}
						value={DimensionsType.NORMAL}
					/>
					<p>Nor.</p>
				</label>
				<label class="flex items-center space-x-2">
					<input
						class="radio"
						type="radio"
						bind:group={$form.dimenstionsType}
						name="radio-direct"
						value={DimensionsType.EXTERIOR}
					/>
					<p>Ext.</p>
				</label>
				<label class="flex items-center space-x-2">
					<input
						class="radio"
						type="radio"
						name="radio-direct"
						bind:group={$form.dimenstionsType}
						value={DimensionsType.ROUNDED}
					/>
					<p>Redo.</p>
				</label>
				<label class="flex items-center space-x-2">
					<input
						class="radio"
						type="radio"
						name="radio-direct"
						bind:group={$form.dimenstionsType}
						value={DimensionsType.WINDOW}
					/>
					<p>Vent.</p>
				</label>
			</div>

			{#if exteriorDimensions}
				<label class="label" for="exteriorHeight">
					<span>Alto Exterior (cm):</span>
					<input
						class="input"
						id="exteriorHeight"
						type="number"
						step="0.01"
						name="exteriorHeight"
						bind:value={$form.exteriorHeight}
						class:input-success={$form.exteriorHeight != null && $form.exteriorHeight > 0}
					/>
				</label>

				<label class="label" for="exteriorWidth">
					<span>Ancho Exterior (cm):</span>
					<input
						class="input"
						id="exteriorWidth"
						type="number"
						step="0.01"
						name="exteriorWidth"
						bind:value={$form.exteriorWidth}
						class:input-success={$form.exteriorWidth != null && $form.exteriorWidth > 0}
					/>
				</label>
			{/if}

			<AutocompleteSection
				sectionTitle={'Molduras'}
				label={'Moldura/Marco'}
				prices={pricing.moldPrices}
				addValue={addFromPricingSelector}
				pricingType={PricingType.MOLD}
				added={addedMold}
			/>

			<dl class="list-dl lg:col-span-2">
				{#each partsToCalulatePreview.filter((p) => p.pre.type === PricingType.MOLD) as part}
					<CartItem
						part={part.post}
						partToDelete={part}
						deleteExtraPart={deletePrecalculatedPreview}
					/>
				{/each}
			</dl>

			<PricingSelectorSection
				sectionTitle={'Cristal'}
				priorityFirst={false}
				label={'Tipo de cristal'}
				prices={pricing.glassPrices}
				addValue={addFromPricingSelector}
				added={addedGlass}
			/>

			<dl class="list-dl lg:col-span-2">
				{#each partsToCalulatePreview.filter((p) => p.pre.type === PricingType.GLASS) as part}
					<CartItem
						part={part.post}
						partToDelete={part}
						deleteExtraPart={deletePrecalculatedPreview}
					/>
				{/each}
			</dl>

			<PricingSelectorSection
				sectionTitle={'Trasera'}
				priorityFirst={false}
				label={'Tipo de trasera'}
				prices={pricing.backPrices}
				addValue={addFromPricingSelector}
				added={addedBack}
			/>

			<dl class="list-dl lg:col-span-2">
				{#each partsToCalulatePreview.filter((p) => p.pre.type === PricingType.BACK) as part}
					<CartItem
						part={part.post}
						partToDelete={part}
						deleteExtraPart={deletePrecalculatedPreview}
					/>
				{/each}
			</dl>

			<PricingSelectorSection
				sectionTitle={'Montajes'}
				priorityFirst={false}
				label={'Tipo de montaje'}
				prices={pricing.labourPrices}
				extraPrices={fabricPrices}
				locationIdForExtraPrices={'CINTA_CANTO_LIENZO_BLANCA'}
				addValue={addFromPricingSelector}
				added={addedLabour}
			/>

			<dl class="list-dl lg:col-span-2">
				{#each partsToCalulatePreview.filter( (p) => [PricingType.LABOUR, PricingType.FABRIC].includes(p.pre.type) ) as part}
					<CartItem
						part={part.post}
						partToDelete={part}
						deleteExtraPart={deletePrecalculatedPreview}
					/>
				{/each}
			</dl>

			<PricingSelectorWithQuantitySection
				added={addedHanger}
				priorityFirst={false}
				sectionTitle={'Colgadores'}
				label={'Colgador'}
				prices={pricing.hangerPrices}
				addItem={addHangerElementsFromSelector}
			/>

			<dl class="list-dl lg:col-span-2">
				{#each partsToCalulatePreview.filter((p) => p.pre.type === PricingType.HANGER) as part}
					<CartItem
						part={part.post}
						partToDelete={part}
						deleteExtraPart={deletePrecalculatedPreview}
					/>
				{/each}
			</dl>

			<PricingSelectorWithQuantitySection
				added={addedOther}
				priorityFirst={false}
				sectionTitle={'Suministros'}
				label={'Elemento'}
				prices={pricing.otherPrices}
				addItem={addOtherElementsFromSelector}
			/>

			<dl class="list-dl lg:col-span-2">
				{#each partsToCalulatePreview.filter((p) => p.pre.type === PricingType.OTHER) as part}
					<CartItem
						part={part.post}
						partToDelete={part}
						deleteExtraPart={deletePrecalculatedPreview}
					/>
				{/each}
			</dl>

			<PricingSelectorSection
				sectionTitle={'Transporte'}
				priorityFirst={false}
				label={'Tipo de transporte'}
				prices={pricing.transportPrices}
				addValue={addFromPricingSelector}
				added={addedTransport}
			/>

			<dl class="list-dl lg:col-span-2">
				{#each partsToCalulatePreview.filter((p) => p.pre.type === PricingType.TRANSPORT) as part}
					<CartItem
						part={part.post}
						partToDelete={part}
						deleteExtraPart={deletePrecalculatedPreview}
					/>
				{/each}
			</dl>

			<Spacer title={'Elementos extra'} />

			<label class="label lg:col-span-2" for="otherElementName">
				<span>Nombre del elemento:</span>
				<input
					class="input"
					type="text"
					name="otherElementName"
					bind:this={otherNameElementInput}
				/>
			</label>

			<label class="label" for="otherElementPrice">
				<span>Precio del elemento:</span>
				<input
					class="input"
					type="number"
					step="0.01"
					min="0"
					name="otherElementPrice"
					bind:this={otherPriceElementInput}
				/>
			</label>

			<label class="label">
				<span>Cantidad</span>
				<select class="select" name="otherQuantityElements" bind:this={otherQuantityElementInput}>
					{#each Array(10) as _, i (i)}
						<option value={i + 1}>{i + 1}</option>
					{/each}
				</select>
			</label>

			<button
				class="variant-filled btn lg:col-span-2"
				type="button"
				on:click={() => {
					addOtherElement();
				}}><Icon class="mr-2" data={plus} /> Añadir a la lista</button
			>

			<dl class="list-dl lg:col-span-2">
				{#each extraParts as part}
					<CartItem {part} partToDelete={part} {deleteExtraPart} />
				{/each}
			</dl>

			<Spacer title={'Descripción de la obra'} />

			<label class="label lg:col-span-2" for="description">
				<span>Descripción:</span>
				<textarea
					class:input-success={addedDescription}
					class="textarea {$errors.description ? 'input-error' : ''}"
					name="description"
					bind:value={$form.description}
				></textarea>
			</label>

			{#if descriptionChipList.length > 0}
				<ChipSet
					observations={descriptionChipList}
					filledObservations={[]}
					addFunction={addDescription}
					removeFunction={removeObservation}
				/>
			{/if}

			<label class="label lg:col-span-2" for="observations">
				<span>Observaciones:</span>
				<textarea
					class:input-success={addedObservations}
					class="textarea {$errors.observations ? 'input-error' : ''}"
					name="observations"
					bind:value={$form.observations}
				></textarea>
			</label>

			<ChipSet
				observations={defaultObservations}
				filledObservations={predefinedObservations}
				addFunction={addObservation}
				removeFunction={removeObservation}
			/>

			<Spacer title={'Otros datos'} />

			<div class="w-full space-x-2 lg:col-span-2">
				<span class="text-md font-medium">
					Cantidad: <input
						class="input w-12"
						type="number"
						step="1"
						min="1"
						bind:value={$form.quantity}
					/>
				</span>

				<button
					type="button"
					class="variant-filled btn btn-md"
					on:click={() => {
						$form.quantity += 1;
					}}><Icon data={plus} /></button
				>
				<button
					type="button"
					class="variant-filled-warning btn btn-md"
					on:click={() => {
						$form.quantity -= 1;
					}}
					disabled={$form.quantity <= 1}
				>
					<Icon data={minus} />
				</button>
			</div>

			{#if !$form.instantDelivery}
				<label class="label" for="deliveryDate">
					<span>Fecha de entrega (Sólo pedidos):</span>
					<input
						class="input {$errors.deliveryDate ? 'input-error' : ''}"
						name="deliveryDate"
						type="date"
						bind:value={$proxyDate}
					/>
				</label>
			{/if}

			<label class="label flex items-center space-x-2" for="instantDelivery">
				<input
					class="checkbox"
					type="checkbox"
					name="instantDelivery"
					bind:checked={$form.instantDelivery}
				/>
				<p>Al momento</p>
			</label>

			<label class="label" for="discount">
				<span>Descuento:</span>
				<select
					name="discount"
					class:input-success={addedDiscount}
					class="select {$errors.discount ? 'input-error' : ''}"
					bind:value={$form.discount}
				>
					<option></option>
					<option value={0}>0</option>
					<option value={10}>1</option>
					<option value={15}>2</option>
					<option value={20}>3</option>
					<option value={25}>4</option>
					<option value={50}>5</option>
				</select>
			</label>

			<label class="label flex items-center space-x-2" for="hasArrow">
				<input class="checkbox" type="checkbox" name="hasArrow" bind:checked={$form.hasArrow} />
				<p>⬇︎</p>
			</label>

			<Spacer title={'Elementos añadidos'} />
			<dl class="list-dl lg:col-span-2">
				{#each CalculatedItemUtilities.sortByPricingType( partsToCalulatePreview, ['pre', 'type'] ) as part}
					<CartItem
						part={part.post}
						partToDelete={part}
						deleteExtraPart={deletePrecalculatedPreview}
					/>
				{/each}
				{#each extraParts as part}
					<CartItem {part} partToDelete={part} {deleteExtraPart} />
				{/each}
			</dl>

			<div class="grid grid-cols-1 lg:col-span-2">
				{#if $form.quantity > 1}
					<span class="text-md font-medium"
						>Total por unidad: {totalPerUnitWithoutDiscount.toFixed(2)} € {#if $form.discount > 0}
							- {totalPerUnitDiscount.toFixed(2)} € Dto = {totalPerUnit.toFixed(2)} €
						{/if}
					</span>
				{/if}
				<span class="text-xl font-medium"
					>Total: {totalWithoutDiscount.toFixed(2)} € {#if $form.discount > 0}
						- {totalDiscount.toFixed(2)} € Dto = {total.toFixed(2)} €
					{/if}
				</span>
			</div>

			{#if missingReasons.length > 0}
				<div class="pt-3 lg:col-span-2">
					<Box title={'Rellene todos los campos'} icon={faRectangleList}>
						<div class="px-4">
							<ul class="list-disc">
								{#each missingReasons as reason}
									<li>{reason}</li>
								{/each}
							</ul>
						</div>
					</Box>
				</div>
			{:else if data.editing}
				<button
					class={`${BUTTON_DEFAULT_CLASSES} ${ACCIONES_NEUTRES_COLORS} text-white lg:col-span-2`}
					type="submit"
					formaction="?/editOrder"
				>
					<Icon class="mr-2" data={faEdit} /> Editar {#if data.editingStatus === OrderStatus.QUOTE}
						presupuesto
					{:else}
						pedido
					{/if}
				</button>
			{:else}
				<button
					class={`${BUTTON_DEFAULT_CLASSES} ${PEDIDOS_COLORS} text-gray-800 lg:col-span-2`}
					type="submit"
					formaction="?/createOrder"
				>
					<Icon class="mr-2" data={faCircleCheck} /> Crear pedido
				</button>
				<button
					class={`${BUTTON_DEFAULT_CLASSES} ${PRESUPUESTOS_COLORS} text-white lg:col-span-2`}
					type="submit"
					formaction="?/createQuote"
				>
					<Icon class="mr-2" data={faClipboardList} /> Crear presupuesto
				</button>
			{/if}
		</form>
	{/await}
{/if}

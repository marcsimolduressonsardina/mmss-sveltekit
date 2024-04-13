<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { dateProxy, superForm } from 'sveltekit-superforms';

	import Icon from 'svelte-awesome';
	import plus from 'svelte-awesome/icons/plus';
	import minus from 'svelte-awesome/icons/minus';
	import check from 'svelte-awesome/icons/check';

	import type {
		CalculatedItemPart,
		PreCalculatedItemPart,
		PreCalculatedItemPartRequest
	} from '$lib/type/api.type';

	import { CalculatedItemUtilities } from '$lib/shared/calculated-item.utilites';
	import { PricingType } from '$lib/type/pricing.type';
	import CartItem from '$lib/components/item/CartItem.svelte';
	import PricingSelectorSection from '$lib/components/item/PricingSelectorSection.svelte';
	import AutocompleteSection from '$lib/components/item/AutocompleteSection.svelte';
	import Spacer from '$lib/components/item/Spacer.svelte';
	import ChipSet from '$lib/components/item/ChipSet.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import type { AllPrices } from '$lib/shared/pricing.utilites';

	export let data: {pricing: Promise<AllPrices>; form: any};

	type TempParts = { pre: PreCalculatedItemPart; post: CalculatedItemPart }[];

	const toastStore = getToastStore();
	const { form, errors, enhance, submitting } = superForm(data.form, {
		dataType: 'json'
	});
	const proxyDate = dateProxy(form, 'deliveryDate', { format: 'date' });

	let total = 0.0;
	let totalPerUnit = 0.0;
	let predefinedObservations: string[] = [];
	let partsToCalculate: PreCalculatedItemPart[] = [];
	let partsToCalulatePreview: TempParts = [];
	let extraParts: CalculatedItemPart[] = [{ description: 'Cantoneras', price: 2.5, quantity: 1 }];

	const defaultObservations = ['Sabe que puede ondular', 'No pegar', 'Muy delicado', 'No recortar'];

	let predefinedElementInput: HTMLSelectElement;
	let predefinedQuantityElementInput: HTMLSelectElement;
	let otherNameElementInput: HTMLInputElement;
	let otherPriceElementInput: HTMLInputElement;
	let otherQuantityElementInput: HTMLSelectElement;

	let addedPP = false;
	let addedGlass = false;
	let addedBack = false;
	let addedMold = false;

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

	function removeObservation(observation: string) {
		predefinedObservations = predefinedObservations.filter((o) => o !== observation);
		predefinedObservations = [...predefinedObservations];
		$form.predefinedObservations = predefinedObservations;
	}

	function getWorkingDimensions() {
		const width = $form.width;
		const height = $form.height;
		const passePartoutWidth = $form.passePartoutWidth;
		const passePartoutHeight = $form.passePartoutHeight;

		return CalculatedItemUtilities.getWorkingDimensions(
			width,
			height,
			passePartoutWidth ?? 0,
			passePartoutHeight ?? 0
		);
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

	async function addFromPricingSelector(pricingType: PricingType, value?: string) {
		if (value == null) {
			return;
		}

		const partToCalculate = {
			id: value,
			quantity: 1,
			type: pricingType
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
		showAddedPartToast(part);
	}

	async function getPartToCalculate(
		partToCalculate: PreCalculatedItemPart
	): Promise<CalculatedItemPart | undefined> {
		const workingDimensions = getWorkingDimensions();
		const request: PreCalculatedItemPartRequest = {
			width: workingDimensions.workingWidth,
			height: workingDimensions.workingHeight,
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
					message: 'Error al calcular el precio. Por favor, inténtelo de nuevo.',
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

	async function addPredefinedElement() {
		const inputElement = predefinedElementInput;
		const value = inputElement ? inputElement.value : null;
		const quantityElement = predefinedQuantityElementInput;
		const quantity = quantityElement ? Number(quantityElement.value) : null;

		if (value && quantity) {
			const pricing = await data.pricing;
			const selected = pricing.otherPrices.find((price) => price.id === value);
			if (selected) {
				const partToCalculate = {
					id: selected.id,
					quantity: quantity,
					type: selected.type
				};

				await processPartToCalculate(partToCalculate);
			}
		}

		if (quantityElement) {
			quantityElement.value = '1';
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
				quantity
			};
			extraParts = [part, ...extraParts];
			$form.extraParts = extraParts;
			showAddedPartToast(part);
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

	function showAddedPartToast(part: CalculatedItemPart) {
		const price = part.price * part.quantity;
		toastStore.trigger({
			message: `${part.description} añadido a la lista. Precio: ${price.toFixed(2)} €.`,
			background: 'variant-filled'
		});
	}

	function updateTotal(
		parts: TempParts,
		eParts: CalculatedItemPart[],
		discount: number,
		quantity: number
	) {
		total = parts.reduce((acc, part) => {
			return acc + part.post.price * part.post.quantity;
		}, 0);

		total += eParts.reduce((acc, part) => {
			return acc + part.price * part.quantity;
		}, 0);

		total -= total * (discount / 100);
		totalPerUnit = total;
		total *= quantity;
	}

	$: {
		updateTotal(partsToCalulatePreview, extraParts, $form.discount, $form.quantity);
		addedMold = partsToCalulatePreview.some((p) => p.pre.type === PricingType.MOLD);
		addedPP = partsToCalulatePreview.some((p) => p.pre.type === PricingType.PP);
		addedGlass = partsToCalulatePreview.some((p) => p.pre.type === PricingType.GLASS);
		addedBack = partsToCalulatePreview.some((p) => p.pre.type === PricingType.BACK);
	}
</script>

<div class="px-2 pt-1 text-2xl font-semibold">Nuevo Pedido</div>
{#if $submitting}
	<ProgressBar text={'Guardando...'} />
{:else}
	{#await data.pricing}
		<ProgressBar />
	{:then pricing}
		<form
			use:enhance
			method="post"
			class="flex w-full flex-col place-content-center space-y-2 px-2 lg:grid lg:grid-cols-2 lg:space-x-2"
		>
			<Spacer title={'Datos de la obra'} />

			<label class="label" for="height">
				<span>Alto:</span>
				<input
					class="input {$errors.height ? 'input-error' : ''}"
					id="height"
					type="number"
					step="0.01"
					name="height"
					on:change={() => handleDimensionsChangeEvent()}
					bind:value={$form.height}
				/>
			</label>

			<label class="label" for="width">
				<span>Ancho:</span>
				<input
					class="input {$errors.width ? 'input-error' : ''}"
					id="width"
					type="number"
					step="0.01"
					name="width"
					on:change={() => handleDimensionsChangeEvent()}
					bind:value={$form.width}
				/>
			</label>

			<label class="label" for="passePartoutWidth"
				><span>Ancho PP:</span>
				<input
					class="input {$errors.passePartoutWidth ? 'input-error' : ''}"
					type="number"
					step="0.01"
					min="0.00"
					name="passePartoutWidth"
					on:change={() => handleDimensionsChangeEvent()}
					bind:value={$form.passePartoutWidth}
				/>
			</label>

			<label class="label" for="passePartoutHeight"
				><span>Alto PP:</span>
				<input
					class="input {$errors.passePartoutHeight ? 'input-error' : ''}"
					type="number"
					step="0.01"
					min="0.00"
					name="passePartoutHeight"
					on:change={() => handleDimensionsChangeEvent()}
					bind:value={$form.passePartoutHeight}
				/>
			</label>

			<label class="label" for="description">
				<span>Descripción:</span>
				<textarea
					class="textarea {$errors.description ? 'input-error' : ''}"
					name="description"
					bind:value={$form.description}
				></textarea>
			</label>

			<label class="label" for="observations">
				<span>Observaciones:</span>
				<textarea
					class="textarea {$errors.observations ? 'input-error' : ''}"
					name="observations"
					bind:value={$form.observations}
				></textarea>
			</label>

			<ChipSet
				observations={defaultObservations}
				addFunction={addObservation}
				removeFunction={removeObservation}
			/>

			<AutocompleteSection
				sectionTitle={'Molduras'}
				label={'Moldura/Marco'}
				prices={pricing.moldPrices}
				addValue={addFromPricingSelector}
				pricingType={PricingType.MOLD}
				added={addedMold}
			/>

			<PricingSelectorSection
				sectionTitle={'Passepartout'}
				label={'Tipo de PP'}
				prices={pricing.ppPrices}
				addValue={addFromPricingSelector}
				pricingType={PricingType.PP}
				added={addedPP}
			/>

			<PricingSelectorSection
				sectionTitle={'Trasera'}
				label={'Tipo de trasera'}
				prices={pricing.backPrices}
				addValue={addFromPricingSelector}
				pricingType={PricingType.BACK}
				added={addedBack}
			/>

			<PricingSelectorSection
				sectionTitle={'Cristal'}
				label={'Tipo de cristal'}
				prices={pricing.glassPrices}
				addValue={addFromPricingSelector}
				pricingType={PricingType.GLASS}
				added={addedGlass}
			/>

			<Spacer title={'Estirar tela'} />

			<button
				class="variant-filled btn lg:col-span-2"
				type="button"
				on:click={() => addFromPricingSelector(PricingType.FABRIC, 'fabric')}
				><Icon class="mr-2" data={plus} /> Añadir estirar tela</button
			>

			<Spacer title={'Otros elementos'} />
			<label class="label" for="predefinedElements">
				<span>Elemento:</span>
				<select
					class="select"
					name="predefinedElements"
					id="predefinedElements"
					bind:this={predefinedElementInput}
				>
					{#each pricing.otherPrices as otherPrice}
						<option value={otherPrice.id}
							>{otherPrice.description} ({otherPrice.price.toFixed(2)} €)</option
						>
					{/each}
				</select>
			</label>
			<label class="label">
				<span>Cantidad</span>
				<select
					class="select"
					name="predefinedQuantityElements"
					bind:this={predefinedQuantityElementInput}
				>
					{#each Array(10) as _, i (i)}
						<option value={i + 1}>{i + 1}</option>
					{/each}
				</select>
			</label>

			<button
				class="variant-filled btn lg:col-span-2"
				type="button"
				on:click={() => {
					addPredefinedElement();
				}}><Icon class="mr-2" data={plus} /> Añadir a la lista</button
			>

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

			<Spacer title={'Otros datos'} />

			<div class="w-full space-x-2 lg:col-span-2">
				<span class="text-md font-medium">Cantidad: {$form.quantity}</span>
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

			<label class="label" for="deliveryDate">
				<span>Fecha de entrega:</span>
				<input
					class="input {$errors.deliveryDate ? 'input-error' : ''}"
					name="deliveryDate"
					type="date"
					bind:value={$proxyDate}
				/>
			</label>

			<label class="label" for="discount">
				<span>Descuento (%):</span>
				<input
					class="input {$errors.discount ? 'input-error' : ''}"
					type="number"
					step="0.01"
					min="0"
					max="100"
					name="discount"
					bind:value={$form.discount}
				/>
			</label>

			<Spacer title={'Elementos añadidos'} />
			<dl class="list-dl lg:col-span-2">
				{#each partsToCalulatePreview as part}
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
					<span class="text-md font-medium">Total por unidad: {totalPerUnit.toFixed(2)} €</span>
				{/if}
				<span class="text-xl font-medium">Total: {total.toFixed(2)} €</span>
			</div>

			<button class="variant-filled-warning btn lg:col-span-2" type="submit"
				><Icon class="mr-2" data={check} /> Crear pedido</button
			>
		</form>
	{/await}
{/if}

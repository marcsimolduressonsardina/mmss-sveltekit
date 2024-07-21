<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { faRuler } from '@fortawesome/free-solid-svg-icons/faRuler';
	import { faQuestion } from '@fortawesome/free-solid-svg-icons/faQuestion';
	import Icon from 'svelte-awesome';
	import check from 'svelte-awesome/icons/check';
	import trash from 'svelte-awesome/icons/trash';
	import plus from 'svelte-awesome/icons/plus';
	import { enhance as sEnhance } from '$app/forms';

	import { PricingFormula, PricingType } from '$lib/type/pricing.type';
	import Spacer from '$lib/components/item/Spacer.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import type { MaxArea, MaxAreaM2 } from '$lib/type/api.type';
	import { fitFormulas, formulasMap, pricingTypesMap } from '$lib/shared/pricing.utilites';

	export let data;
	export let isNew: boolean;
	const toastStore = getToastStore();
	const { form, errors, enhance, submitting } = superForm(data.form, {
		dataType: 'json'
	});

	let maxD1Value: number | undefined;
	let maxD2Value: number | undefined;
	let maxM2Value: number | undefined;
	let priceValue: number | undefined;

	let isAreaFit = fitFormulas.includes($form.formula);
	let areas: MaxArea[] = $form.areas;
	let areasM2: MaxAreaM2[] = $form.areasM2;

	function handleFormulaChange() {
		isAreaFit = fitFormulas.includes($form.formula);
		areas = [];
		areasM2 = [];
		$form.areas = [];
		$form.areasM2 = [];
	}

	function handleAddAreaM2() {
		if (maxM2Value && priceValue && maxM2Value > 0 && priceValue >= 0) {
			const areaM2 = {
				a: maxM2Value,
				price: priceValue
			};

			addAreaM2(areaM2);
			maxM2Value = undefined;
			priceValue = undefined;
		} else {
			toastStore.trigger({
				message: 'Algunos campos son incorrectos',
				background: 'variant-filled-error'
			});
		}
	}

	function handleAddArea() {
		if (
			maxD1Value &&
			maxD2Value &&
			priceValue &&
			maxD1Value > 0 &&
			maxD2Value > 0 &&
			priceValue >= 0
		) {
			const area = {
				d1: Math.max(maxD1Value, maxD2Value),
				d2: Math.min(maxD1Value, maxD2Value),
				price: priceValue
			};

			addArea(area);
			maxD1Value = undefined;
			maxD2Value = undefined;
			priceValue = undefined;
		} else {
			toastStore.trigger({
				message: 'Algunos campos son incorrectos',
				background: 'variant-filled-error'
			});
		}
	}

	function handleAreaDelete(area: MaxArea) {
		areas = areas.filter((a) => a !== area);
		$form.areas = areas;
	}

	function handleAreaM2Delete(area: MaxAreaM2) {
		areasM2 = areasM2.filter((a) => a !== area);
		$form.areasM2 = areasM2;
	}

	function sortAreas(a: MaxArea, b: MaxArea) {
		if (a.d1 * a.d2 === b.d1 * b.d2) {
			if (a.d1 === b.d1) {
				return a.d2 - b.d2;
			}

			return a.d1 - b.d1;
		}

		return a.d1 * a.d2 - b.d1 * b.d2;
	}

	function addArea(area: MaxArea) {
		const map = new Map<string, MaxArea>();
		[...areas, area].forEach((a) => map.set(`${a.d1}x${a.d2}`, a));
		areas = [...map.values()].sort(sortAreas);
		$form.areas = areas;
	}

	function addAreaM2(area: MaxAreaM2) {
		const map = new Map<string, MaxAreaM2>();
		[...areasM2, area].forEach((a) => map.set(`${a.a}`, a));
		areasM2 = [...map.values()].sort((x, y) => x.a - y.a);
		$form.areasM2 = areasM2;
	}

	let formLoading = false;
</script>

<div class="px-2 pt-1 text-xl font-semibold">
	{#if isNew}
		Crear nuevo precio
	{:else}
		Editar precio
	{/if}
</div>

{#if $submitting || formLoading}
	<ProgressBar />
{:else}
	<form
		use:enhance
		method="post"
		action="?/createOrEdit"
		class="flex w-full flex-col place-content-center gap-2 px-2 lg:grid lg:grid-cols-2"
	>
		<label class="label" for="id">
			<span>ID:</span>
			<input
				class="input {$errors.id ? 'input-error' : ''}"
				id="id"
				type="text"
				name="id"
				disabled={isNew ? false : true}
				bind:value={$form.id}
			/>
		</label>

		<label class="label" for="description">
			<span>Descripción:</span>
			<input
				class="input {$errors.description ? 'input-error' : ''}"
				id="description"
				type="text"
				name="description"
				bind:value={$form.description}
			/>
		</label>

		<label class="label">
			<span>Tipo: </span>

			{#if !isNew && $form.type === PricingType.MOLD}
				<select class="select" name="type" disabled={true}>
					<option>Marco/Moldura</option>
				</select>
			{:else}
				<select class="select" name="type" bind:value={$form.type} disabled={!isNew}>
					{#each Object.entries(pricingTypesMap) as [p, label]}
						<option value={p}>{label}</option>
					{/each}
				</select>
			{/if}
		</label>

		<label class="label">
			<span>Cómo calcular: </span>
			{#if !isNew && $form.type === PricingType.MOLD}
				<select class="select" name="type" disabled={true}>
					<option>Marco/Moldura</option>
				</select>
			{:else}
				<select
					class="select"
					name="formula"
					bind:value={$form.formula}
					on:change={handleFormulaChange}
				>
					{#each Object.entries(formulasMap) as [p, label]}
						<option value={p}>{label}</option>
					{/each}
				</select>
			{/if}
		</label>

		<Spacer title={'Datos del precio'} />

		{#if isAreaFit}
			{#if $form.formula === PricingFormula.FORMULA_FIT_AREA}
				<label class="label" for="d1">
					<span>Dimensión máxima 1:</span>
					<input
						class="input"
						id="d1"
						type="number"
						step="0.01"
						name="d1"
						bind:value={maxD1Value}
					/>
				</label>
				<label class="label" for="d2">
					<span>Dimensión máxima 2:</span>
					<input
						class="input"
						id="d2"
						type="number"
						step="0.01"
						name="d2"
						bind:value={maxD2Value}
					/>
				</label>
				<label class="label lg:col-span-2">
					<span>Precio del trozo: </span>
					<div class="space-y-2 lg:grid lg:grid-cols-2 lg:space-x-2 lg:space-y-0">
						<input
							class="input"
							id="piecePrice"
							type="number"
							step="0.01"
							name="piecePrice"
							bind:value={priceValue}
						/>
						<button
							class="variant-filled btn w-full lg:w-auto"
							type="button"
							on:click={handleAddArea}
						>
							<Icon class="mr-2" data={plus} /> Añadir
						</button>
					</div>
				</label>
				{#if areas.length > 0}
					<Spacer title={'Trozos añadidos'} />
					<dl class="list-dl lg:col-span-2">
						{#each areas as area}
							<div>
								<span class="badge bg-green-200"><Icon data={faRuler} /></span>
								<span class="flex-auto">
									<dt>Medidas ≤ {area.d1} x {area.d2}</dt>
									<dd>{area.price.toFixed(2)} €</dd>
								</span>
								<button
									type="button"
									class="btn bg-indigo-300"
									on:click={() => handleAreaDelete(area)}
									><Icon class="mr-2" data={trash} /> Eliminar</button
								>
							</div>
						{/each}
					</dl>
				{/if}
			{/if}
			{#if $form.formula === PricingFormula.FORMULA_FIT_AREA_M2}
				<div class="pb-2 lg:col-span-2">
					<aside class="alert variant-filled-secondary">
						<!-- Icon -->
						<div><Icon scale={3} data={faQuestion} /></div>
						<!-- Message -->
						<div class="alert-message">
							<h4 class="h4">Área mayor o igual que (≥)</h4>
							<p>
								No existe la posibilidad de introducir un precio del tipo mayor o igual que, todos
								deben ser menor o igual que. Para solucionar este problema, introduzca un valor para
								área máxima lo suficientemente grande para el último trozo (Área ≤ 200 m2).
							</p>
						</div>
					</aside>
				</div>
				<label class="label" for="m2">
					<span>Área máxima :</span>
					<input
						class="input"
						id="m2"
						type="number"
						step="0.01"
						name="m2"
						bind:value={maxM2Value}
					/>
				</label>
				<label class="label" for="piecePrice">
					<span>Precio del trozo: </span>
					<input
						class="input"
						id="piecePrice"
						type="number"
						step="0.01"
						name="piecePrice"
						bind:value={priceValue}
					/>
				</label>
				<button
					class="w-ful variant-filled btn lg:col-span-2"
					type="button"
					on:click={handleAddAreaM2}
				>
					<Icon class="mr-2" data={plus} /> Añadir
				</button>
				{#if areasM2.length > 0}
					<Spacer title={'Trozos añadidos'} />
					<dl class="list-dl lg:col-span-2">
						{#each areasM2 as area}
							<div>
								<span class="badge bg-green-200"><Icon data={faRuler} /></span>
								<span class="flex-auto">
									<dt>Área ≤ {area.a} m2</dt>
									<dd>{area.price.toFixed(2)} €</dd>
								</span>
								<button
									type="button"
									class="btn bg-indigo-300"
									on:click={() => handleAreaM2Delete(area)}
									><Icon class="mr-2" data={trash} /> Eliminar</button
								>
							</div>
						{/each}
					</dl>
				{/if}
			{/if}
		{:else}
			<label class="label lg:col-span-2" for="price">
				<span>Precio:</span>
				<input
					class="input {$errors.price ? 'input-error' : ''}"
					id="price"
					type="number"
					step="0.01"
					name="price"
					bind:value={$form.price}
				/>
			</label>

			<label class="label" for="maxD1">
				<span>Alto máximo:</span>
				<input
					class="input {$errors.maxD1 ? 'input-error' : ''}"
					id="maxD1"
					type="number"
					step="0.01"
					name="maxD1"
					bind:value={$form.maxD1}
				/>
			</label>

			<label class="label" for="maxD2">
				<span>Ancho Máximo:</span>
				<input
					class="input {$errors.maxD2 ? 'input-error' : ''}"
					id="maxD2"
					type="number"
					step="0.01"
					name="maxD2"
					bind:value={$form.maxD2}
				/>
			</label>
		{/if}

		<Spacer title={'Otros datos'} />
		<label class="label" for="priority">
			<span>Prioridad (Cuanto más alto, antes saldrá en la lista):</span>
			<input
				class="input {$errors.priority ? 'input-error' : ''}"
				id="priority"
				type="number"
				step="1"
				name="priority"
				bind:value={$form.priority}
			/>
		</label>

		<label class="label" for="priority">
			<span>Precio mínimo:</span>
			<input
				class="input {$errors.minPrice ? 'input-error' : ''}"
				id="minPrice"
				type="number"
				step="0.01"
				name="minPrice"
				bind:value={$form.minPrice}
			/>
		</label>
		<label class="label" for="discontAllowed">
			<span>Descuento permitido:</span>
			<input class="checkbox" type="checkbox" bind:checked={$form.discountAllowed} />
		</label>
		<button class="variant-filled-warning btn lg:col-span-2" type="submit"
			><Icon class="mr-2" data={check} /> Guardar</button
		>
	</form>

	{#if !isNew}
		<div class="pb-3 pl-2 pr-2 pt-3">
			<form
				class="w-full"
				method="post"
				action="?/deletePrice"
				use:sEnhance={({ cancel }) => {
					if (
						!confirm(
							'Estás seguro que quieres eliminar el precio? Los pedidos ya realizados no se verán afectados'
						)
					) {
						cancel();
						return;
					}

					formLoading = true;
					return async ({ update }) => {
						await update();
					};
				}}
			>
				<button class="variant-filled-error btn w-full">
					<Icon class="mr-1" data={trash} /> Eliminar precio
				</button>
			</form>
		</div>
	{/if}
{/if}

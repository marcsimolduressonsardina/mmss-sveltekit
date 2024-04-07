<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { faRuler } from '@fortawesome/free-solid-svg-icons/faRuler';
	import Icon from 'svelte-awesome';
	import check from 'svelte-awesome/icons/check';
	import trash from 'svelte-awesome/icons/trash';
	import plus from 'svelte-awesome/icons/plus';

	import { PricingFormula } from '$lib/type/pricing.type';
	import Spacer from '$lib/components/item/Spacer.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import type { MaxArea } from '$lib/type/api.type';
	import { formulasMap, pricingTypesMap } from '$lib/shared/pricing.utilites';

	export let data;
	export let isNew: boolean;
	const toastStore = getToastStore();
	const { form, errors, enhance, submitting } = superForm(data.form, {
		dataType: 'json'
	});

	let maxD1Value: number | undefined;
	let maxD2Value: number | undefined;
	let priceValue: number | undefined;

	let isAreaFit = false;
	let areas: MaxArea[] = $form.areas;

	function handleFormulaChange() {
		isAreaFit = $form.formula === PricingFormula.FORMULA_FIT_AREA;
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
</script>

<div class="px-2 pt-1 text-xl font-semibold">
	{#if isNew}
		Crear nuevo precio
	{:else}
		Editar precio
	{/if}
</div>

{#if $submitting}
	<ProgressBar />
{:else}
	<form
		use:enhance
		method="post"
		class="flex w-full flex-col place-content-center space-y-2 px-2 lg:grid lg:grid-cols-2 lg:gap-2 lg:space-y-0"
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
			<select class="select" name="type" bind:value={$form.type} disabled={isNew ? false : true}>
				{#each Object.entries(pricingTypesMap) as [p, label]}
					<option value={p}>{label}</option>
				{/each}
			</select>
		</label>

		<label class="label">
			<span>Cómo calcular: </span>
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
		</label>

		<Spacer title={'Datos del precio'} />

		{#if isAreaFit}
			<label class="label" for="d1">
				<span>Dimensión máxima 1:</span>
				<input class="input" id="d1" type="number" step="0.01" name="d1" bind:value={maxD1Value} />
			</label>
			<label class="label" for="d2">
				<span>Dimensión máxima 2:</span>
				<input class="input" id="d2" type="number" step="0.01" name="d2" bind:value={maxD2Value} />
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
		<button class="variant-filled-warning btn lg:col-span-2" type="submit"
			><Icon class="mr-2" data={check} /> Guardar</button
		>
	</form>
{/if}

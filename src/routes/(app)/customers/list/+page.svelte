<script lang="ts">
	import type { PageData } from './$types';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import type { Customer } from '$lib/type/api.type';
	import { faUserLarge } from '@fortawesome/free-solid-svg-icons/faUserLarge';
	import { Icon } from 'svelte-awesome';

	export let data: PageData;
	let searchValue = '';

	function normalizeString(str: string): string {
		return str
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLocaleLowerCase();
	}

	function isWordPresent(inputString1: string, inputString2: string): boolean {
		// Normalize input strings to ensure consistent comparison
		const normalizedInputString1 = normalizeString(inputString1);
		const normalizedInputString2 = normalizeString(inputString2);

		// Split normalized input strings into arrays of words
		const words1 = normalizedInputString1.split(' ');
		const words2 = normalizedInputString2.split(' ');

		// Iterate over each word in the first input string
		for (const word1 of words1) {
			// Check if the current word is present or partially present in the second input string
			if (words2.some((word2) => word2.includes(word1))) {
				return true; // If found, return true
			}
		}

		return false; // If no match is found, return false
	}

	function filterCustomers(customers: Customer[], search: string): Customer[] {
		if (searchValue.length === 0) {
			return customers;
		}

		return customers.filter((c) => isWordPresent(search, c.name));
	}
</script>

<div class="pl-3 pr-3 pt-3 text-lg font-medium">Todos los clientes</div>
<div class="space flex w-full flex-col gap-1 p-3">
	{#await data.customers}
		<ProgressBar />
	{:then customers}
		<div
			class="mb-3 mt-3 flex w-full flex-col place-content-center items-center justify-center gap-1"
		>
			<input
				bind:value={searchValue}
				class="input"
				type="text"
				placeholder="Buscar por nombre..."
			/>
		</div>

		<div class="flex w-full flex-col gap-1 lg:grid lg:grid-cols-4">
			{#each filterCustomers(customers, searchValue) as customer}
				<a class="variant-filled-warning btn" href={`/customers/${customer.id}`}>
					<Icon class="mr-1" data={faUserLarge} />{customer.name}
				</a>
			{/each}
		</div>
	{/await}
</div>

<script lang="ts">
	import type { Customer, Order } from '$lib/type/api.type';
	import { faWhatsapp } from '@fortawesome/free-brands-svg-icons/faWhatsapp';
	import Button from '$lib/components/button/Button.svelte';
	import { CustomerUtilites } from '$lib/shared/customer.utilities';
	import { WHATSAPP_COLORS } from '$lib/ui/ui.constants';
	import ClickButton from './ClickButton.svelte';

	export let label: string;
	export let message: string;
	export let customer: Customer;
	export let disabled: boolean = false;
	export let order: Order | undefined = undefined;
	export let notifyOrder: boolean = false;

	async function handleNotify() {
		if (order == null) {
			return;
		}

		const tempLabel = label;
		label = 'Cargando...';
		await fetch(`/api/orders/${order.id}/notify`, {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		});
		label = `${tempLabel} (YA AVISADO)`;

		const newWindowUrl = CustomerUtilites.getWhatsappLink(customer, message);
		window.open(newWindowUrl, '_blank');
	}
</script>

{#if notifyOrder}
	<ClickButton
		onClick={handleNotify}
		{disabled}
		icon={faWhatsapp}
		text={label}
		colorClasses={WHATSAPP_COLORS}
	></ClickButton>
{:else}
	<Button
		icon={faWhatsapp}
		newWindow={true}
		text={label}
		{disabled}
		link={CustomerUtilites.getWhatsappLink(customer, message)}
		colorClasses={WHATSAPP_COLORS}
	></Button>
{/if}

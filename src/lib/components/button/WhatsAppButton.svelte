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
	export let orders: Order[] = [];
	export let notifyOrder: boolean = false;
	export let tooltipText: string | undefined = undefined;
	export let handleAfterNotify: () => void = () => {};

	async function handleNotify() {
		if (orders.length === 0) {
			return;
		}

		const tempLabel = label;
		label = 'Cargando...';
		const promises = orders.map((order) => notifySingleOrder(order.id));
		await Promise.all(promises);
		label = `${tempLabel}`;

		const newWindowUrl = CustomerUtilites.getWhatsappLink(customer, message);
		window.open(newWindowUrl, '_blank');
		orders.forEach((order) => {
			order.notified = true;
		});

		handleAfterNotify();
	}

	async function notifySingleOrder(orderId: string) {
		fetch(`/api/orders/${orderId}/notify`, {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		});
	}
</script>

{#if notifyOrder && !disabled}
	<ClickButton onClick={handleNotify} icon={faWhatsapp} text={label} colorClasses={WHATSAPP_COLORS}
	></ClickButton>
{:else}
	<Button
		icon={faWhatsapp}
		newWindow={true}
		text={label}
		{disabled}
		{tooltipText}
		link={CustomerUtilites.getWhatsappLink(customer, message)}
		colorClasses={WHATSAPP_COLORS}
	></Button>
{/if}

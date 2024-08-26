<script lang="ts">
	import type { Customer } from '$lib/type/api.type';
	import { faWhatsapp } from '@fortawesome/free-brands-svg-icons/faWhatsapp';
	import Button from '$lib/components/button/Button.svelte';
	import { CustomerUtilites } from '$lib/shared/customer.utilities';
	import { WHATSAPP_COLORS } from '$lib/ui/ui.constants';

	export let label: string;
	export let message: string;
	export let customer: Customer;
</script>

<Button
	icon={faWhatsapp}
	newWindow={true}
	text={label}
	link={CustomerUtilites.getWhatsappLink(customer, message)}
	colorClasses={WHATSAPP_COLORS}
></Button>

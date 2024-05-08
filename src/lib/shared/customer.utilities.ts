import type { Customer } from '$lib/type/api.type';
import { z } from 'zod';

export const customerSchema = z.object({
	name: z.string().min(3).default(''),
	phone: z.string().min(9).default('+34')
});

export class CustomerUtilites {
	public static getWhatsappLink(customer: Customer, text?: string): string {
		const link = `https://wa.me/${customer.phone.replace('+', '')}`;
		const encodedText = text == null ? '' : `?text=${encodeURI(text)}`;
		return link + encodedText;
	}
}

import type { Customer } from '@marcsimolduressonsardina/core';
import { z } from 'zod';

const phoneRegex = z
	.string()
	.regex(/^\+\d{1,3}\d{9,15}$/)
	.default('+34');

export const customerSchema = z.object({
	name: z.string().min(3).default(''),
	phone: phoneRegex
});

export const linkCustomerSchema = z.object({
	name: z.string().default('').optional(),
	phone: phoneRegex
});

export class CustomerUtilites {
	public static getWhatsappLink(customer: Customer, text?: string): string {
		const link = `https://wa.me/${customer.phone.replace('+', '')}`;
		const encodedText = text == null ? '' : `?text=${encodeURI(text)}`;
		return link + encodedText;
	}
}

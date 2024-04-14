import { z } from 'zod';

export const customerSchema = z.object({
	name: z.string().min(3).default(''),
	phone: z.string().min(9).default('+34')
});
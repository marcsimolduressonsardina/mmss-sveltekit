import type { Order } from '$lib/type/api.type';

export class OrderUtilites {
	public static getOrderPublicId(order: Order): string {
		const date = new Date(order.createdAt);
		const month = date.getMonth() + 1;
		let monthString = '';
		if (month < 10) {
			monthString = `0${month}`;
		} else {
			monthString = `${month}`;
		}

		const phoneWithoutPlus = order.customer.phone.replace('+', '');
		return `${date.getFullYear()}${monthString}${date.getDate()}/${date.getSeconds()}/${phoneWithoutPlus}`;
	}
}

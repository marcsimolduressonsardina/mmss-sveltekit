import { env as svelteEnv } from '$env/dynamic/private';

export const env = {
	customerTable: svelteEnv['CUSTOMER_TABLE'] ?? '',
	itemOrderTable: svelteEnv['ITEM_ORDER_TABLE'] ?? '',
	calculatedItemOrderTable: svelteEnv['CALCULATED_ITEM_ORDER_TABLE'] ?? '',
	orderTable: svelteEnv['ORDER_TABLE'] ?? '',
	userTable: svelteEnv['USER_TABLE'] ?? '',
	listPricingTable: svelteEnv['LIST_PRICING_TABLE'] ?? '',
	moldPricesBucket: svelteEnv['MOLD_PRICES_BUCKET'] ?? ''
};

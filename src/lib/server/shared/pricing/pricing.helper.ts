import { PricingService } from '$lib/server/service/pricing.service';
import type { AllPrices } from '$lib/shared/pricing.utilites';
import { PricingType } from '$lib/type/pricing.type';

export class PricingHelper {
	public static async getPricing(): Promise<AllPrices> {
		const pricingProvider = new PricingService();
		const moldPricesPromise = pricingProvider.getPricingList(PricingType.MOLD);
		const glassPromise = pricingProvider.getPricingList(PricingType.GLASS);
		const ppPricesPromise = pricingProvider.getPricingList(PricingType.PP);
		const backPricesPromise = pricingProvider.getPricingList(PricingType.BACK);
		const labourPricesPromise = pricingProvider.getPricingList(PricingType.LABOUR);
		const otherPricesPromise = pricingProvider.getPricingList(PricingType.OTHER);
		const [moldPrices, glassPrices, ppPrices, backPrices, otherPrices, labourPrices] =
			await Promise.all([
				moldPricesPromise,
				glassPromise,
				ppPricesPromise,
				backPricesPromise,
				otherPricesPromise,
				labourPricesPromise
			]);
		return { moldPrices, glassPrices, ppPrices, backPrices, otherPrices, labourPrices };
	}
}

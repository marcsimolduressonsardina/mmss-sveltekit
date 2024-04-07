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
		const otherPricesPromise = pricingProvider.getPricingList(PricingType.OTHER);
		const [moldPrices, glassPrices, ppPrices, backPrices, otherPrices] = await Promise.all([
			moldPricesPromise,
			glassPromise,
			ppPricesPromise,
			backPricesPromise,
			otherPricesPromise
		]);
		return { moldPrices, glassPrices, ppPrices, backPrices, otherPrices };
	}
}

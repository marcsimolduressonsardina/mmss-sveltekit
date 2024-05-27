import type { OrderDimensions } from '$lib/type/order.type';
import type { CalculatedItem, PPDimensions } from '../type/api.type';

export const cornersId = 'cantoneras_extra';
export const otherExtraId = 'other_extra';

export class CalculatedItemUtilities {
	public static getOrderDimensions(
		width: number,
		height: number,
		pp: number,
		ppDimensions?: PPDimensions
	): OrderDimensions {
		const { totalWidth, totalHeight } = CalculatedItemUtilities.getTotalDimensions(
			width,
			height,
			pp,
			ppDimensions
		);

		const workingWidth = CalculatedItemUtilities.roundUpToNearestGreaterFiveOrTen(totalWidth);
		const workingHeight = CalculatedItemUtilities.roundUpToNearestGreaterFiveOrTen(totalHeight);
		return {
			workingWidth,
			workingHeight,
			totalHeight,
			totalWidth,
			originalHeight: height,
			originalWidth: width
		};
	}

	public static getTotalDimensions(
		width: number,
		height: number,
		pp: number,
		ppDimensions?: PPDimensions
	): { totalWidth: number; totalHeight: number } {
		if (ppDimensions !== undefined) {
			const totalWidth = width + ppDimensions.left + ppDimensions.right;
			const totalHeight = height + ppDimensions.up + ppDimensions.down;
			return { totalWidth, totalHeight };
		} else {
			const totalWidth = width + 2 * pp;
			const totalHeight = height + 2 * pp;
			return { totalWidth, totalHeight };
		}
	}

	public static getMoldDescription(moldId: string): string {
		const before_ = moldId.split('_')[0];
		const after_ = moldId.split('_')[1];
		return `${after_} - UBI: ${before_}`;
	}

	public static getUnitPriceWithoutDiscount(calculatedItem: CalculatedItem): number {
		const totalWithoutDiscount = calculatedItem.total / (1 - calculatedItem.discount / 100);
		const unitWithoutDiscount = totalWithoutDiscount / calculatedItem.quantity;
		return Math.ceil(unitWithoutDiscount * 100) / 100;
	}

	public static getUnitPriceWithDiscount(calculatedItem: CalculatedItem): number {
		const unitWithoutDiscount = calculatedItem.total / calculatedItem.quantity;
		return Math.ceil(unitWithoutDiscount * 100) / 100;
	}

	public static getPriceWithoutDiscount(calculatedItem: CalculatedItem): number {
		const totalWithoutDiscount = calculatedItem.total / (1 - calculatedItem.discount / 100);
		return Math.ceil(totalWithoutDiscount * 100) / 100;
	}

	private static roundUpToNearestGreaterFiveOrTen(value: number): number {
		if (value % 5 === 0) {
			return value;
		}

		return Math.ceil(value / 5) * 5;
	}
}

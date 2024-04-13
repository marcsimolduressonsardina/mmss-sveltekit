import type { PPDimensions } from '../type/api.type';
export class CalculatedItemUtilities {
	public static getWorkingDimensions(
		width: number,
		height: number,
		pp: number,
		ppDimensions?: PPDimensions
	): { workingWidth: number; workingHeight: number } {
		if (ppDimensions !== undefined) {
			const workingWidth = CalculatedItemUtilities.roundUpToNearestGreaterFiveOrTen(
				width + ppDimensions.left + ppDimensions.right
			);
			const workingHeight = CalculatedItemUtilities.roundUpToNearestGreaterFiveOrTen(
				height + ppDimensions.up + ppDimensions.down
			);
			return { workingWidth, workingHeight };
		} else {
			const workingHeight = CalculatedItemUtilities.roundUpToNearestGreaterFiveOrTen(
				width + 2 * pp
			);
			const workingWidth = CalculatedItemUtilities.roundUpToNearestGreaterFiveOrTen(
				height + 2 * pp
			);
			return { workingWidth, workingHeight };
		}
	}

	private static roundUpToNearestGreaterFiveOrTen(value: number): number {
		if (value % 5 === 0) {
			return value;
		}

		return Math.ceil(value / 5) * 5;
	}
}

import type { PPDimensions } from '../type/api.type';
export class CalculatedItemUtilities {
	public static getWorkingDimensions(
		width: number,
		height: number,
		pp: number,
		ppDimensions?: PPDimensions
	): { workingWidth: number; workingHeight: number } {
		const { totalWidth, totalHeight } = CalculatedItemUtilities.getTotalDimensions(
			width,
			height,
			pp,
			ppDimensions
		);

		const workingWidth = CalculatedItemUtilities.roundUpToNearestGreaterFiveOrTen(totalWidth);
		const workingHeight = CalculatedItemUtilities.roundUpToNearestGreaterFiveOrTen(totalHeight);
		return { workingWidth, workingHeight };
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

	private static roundUpToNearestGreaterFiveOrTen(value: number): number {
		if (value % 5 === 0) {
			return value;
		}

		return Math.ceil(value / 5) * 5;
	}
}

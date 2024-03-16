export class CalculatedItemUtilities {
	public static getWorkingDimensions(
		width: number,
		height: number,
		passePartoutWidth: number,
		passePartoutHeight: number
	): { workingWidth: number; workingHeight: number } {
		const workingHeight = CalculatedItemUtilities.roundUpToNearestGreaterFiveOrTen(
			width + 2 * passePartoutWidth
		);
		const workingWidth = CalculatedItemUtilities.roundUpToNearestGreaterFiveOrTen(
			height + 2 * passePartoutHeight
		);
		return { workingWidth, workingHeight };
	}

	private static roundUpToNearestGreaterFiveOrTen(value: number): number {
		if (value % 5 === 0) {
			return value;
		}

		return Math.ceil(value / 5) * 5;
	}
}

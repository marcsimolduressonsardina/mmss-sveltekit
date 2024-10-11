import {
	faCheckCircle,
	faTruck,
	faClockRotateLeft,
	faClipboardList,
	type IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import {
	BUTTON_DEFAULT_CLASSES,
	DISABLED_COLORS,
	HOME_BUTTON_DEFAULT_CLASSES
} from './ui.constants';
import { OrderStatus } from '@marcsimolduressonsardina/core';

export function generateButtonClasses(
	textWhite: boolean,
	colorClasses: string,
	disabled: boolean,
	homeButton: boolean = false
): string {
	return `${disabled ? DISABLED_COLORS : colorClasses} ${textWhite ? 'text-white' : 'text-gray-800'} ${homeButton ? HOME_BUTTON_DEFAULT_CLASSES : BUTTON_DEFAULT_CLASSES}`;
}

interface IUIInfo {
	colors: string;
	gradientClasses: string;
	statusIcon: IconDefinition;
}

const redGradientClasses = 'from-red-800 via-red-700 to-red-600';
const redColors = 'bg-red-700 hover:bg-red-800 focus:ring-red-800';

export function getStatusUIInfo(status: OrderStatus): IUIInfo {
	let colors = '';
	let gradientClasses = '';
	let statusIcon = faTruck;
	switch (status) {
		case OrderStatus.PENDING:
			gradientClasses = 'from-blue-800 via-blue-700 to-blue-600';
			colors = 'bg-blue-600 hover:bg-blue-700 focus:bg-blue-500';
			statusIcon = faClockRotateLeft;
			break;
		case OrderStatus.FINISHED:
			gradientClasses = 'from-orange-600 via-orange-500 to-orange-400';
			colors = 'bg-orange-500 hover:bg-orange-600 focus:bg-orange-400';
			statusIcon = faCheckCircle;
			break;
		case OrderStatus.PICKED_UP:
			gradientClasses = 'from-green-800 via-green-700 to-green-600';
			colors = 'bg-green-700 hover:bg-green-800 focus:ring-green-500';
			statusIcon = faTruck;
			break;
		case OrderStatus.DELETED:
			break;
		case OrderStatus.QUOTE:
			gradientClasses = 'from-purple-800 via-purple-700 to-purple-600';
			colors = 'bg-purple-600 hover:bg-purple-700 focus:bg-purple-500';
			statusIcon = faClipboardList;
			break;
	}

	return { statusIcon, colors, gradientClasses };
}

export function getStatusUIInfoWithPaymentInfo(status: OrderStatus, payed: boolean): IUIInfo {
	const uiInfo = getStatusUIInfo(status);

	if ((status === OrderStatus.PICKED_UP && !payed) || (status === OrderStatus.FINISHED && payed)) {
		return { ...uiInfo, colors: redColors, gradientClasses: redGradientClasses };
	}

	return uiInfo;
}

import { OrderStatus } from '$lib/type/order.type';
import {
	faCheckCircle,
	faTimesCircle,
	faTruck,
	faClockRotateLeft,
	faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import {
	BUTTON_DEFAULT_CLASSES,
	DISABLED_COLORS,
	HOME_BUTTON_DEFAULT_CLASSES,
	LISTADO_FINALIZADOS,
	MARCAR_PENDIENTE_COLORS,
	MARCAR_RECOGIDO_COLORS
} from './ui.constants';

export function generateButtonClasses(
	textWhite: boolean,
	colorClasses: string,
	disabled: boolean,
	homeButton: boolean = false
): string {
	return `${disabled ? DISABLED_COLORS : colorClasses} ${textWhite ? 'text-white' : 'text-gray-800'} ${homeButton ? HOME_BUTTON_DEFAULT_CLASSES : BUTTON_DEFAULT_CLASSES}`;
}

export function getStatusUIInfo(status: OrderStatus) {
	let colors = '';
	let statusIcon = faTruck;
	switch (status) {
		case OrderStatus.PENDING:
			colors = MARCAR_PENDIENTE_COLORS;
			statusIcon = faClockRotateLeft;
			break;
		case OrderStatus.FINISHED:
			colors = LISTADO_FINALIZADOS;
			statusIcon = faCheckCircle;
			break;
		case OrderStatus.PICKED_UP:
			colors = MARCAR_RECOGIDO_COLORS;
			statusIcon = faTruck;
			break;
		case OrderStatus.DELETED:
			colors = '';
			statusIcon = faTimesCircle;
			break;
		case OrderStatus.QUOTE:
			colors = '';
			statusIcon = faClipboardList;
			break;
	}

	return { statusIcon, colors };
}

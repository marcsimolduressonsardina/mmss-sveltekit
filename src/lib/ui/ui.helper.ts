import {
	BUTTON_DEFAULT_CLASSES,
	DISABLED_COLORS,
	HOME_BUTTON_DEFAULT_CLASSES
} from './ui.constants';

export function generateButtonClasses(
	textWhite: boolean,
	colorClasses: string,
	disabled: boolean,
	homeButton: boolean = false
): string {
	return `${disabled ? DISABLED_COLORS : colorClasses} ${textWhite ? 'text-white' : 'text-gray-800'} ${homeButton ? HOME_BUTTON_DEFAULT_CLASSES : BUTTON_DEFAULT_CLASSES}`;
}

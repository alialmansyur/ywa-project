import { Platform } from 'react-native';

export const MENU_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 75;
export const MENU_BAR_PADDING_BOTTOM = Platform.OS === 'ios' ? 28 : 20;
export const MENU_BAR_PADDING_TOP = 8;
export const MENU_BAR_CONTENT_PADDING = MENU_BAR_HEIGHT + 8;

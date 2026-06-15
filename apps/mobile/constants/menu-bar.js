import { Platform } from 'react-native';

const MENU_BAR_BASE_HEIGHT = Platform.OS === 'ios' ? 60 : 55;
const MENU_BAR_MIN_PADDING_BOTTOM = Platform.OS === 'ios' ? 28 : 14;
export const MENU_BAR_PADDING_TOP = 8;

export const getMenuBarPaddingBottom = (bottomInset = 0) => Math.max(MENU_BAR_MIN_PADDING_BOTTOM, Number(bottomInset || 0) + 8);

export const getMenuBarHeight = (bottomInset = 0) => MENU_BAR_BASE_HEIGHT + MENU_BAR_PADDING_TOP + getMenuBarPaddingBottom(bottomInset);

export const getMenuBarContentPadding = (bottomInset = 0) => getMenuBarHeight(bottomInset) + 8;

export const MENU_BAR_PADDING_BOTTOM = getMenuBarPaddingBottom();
export const MENU_BAR_HEIGHT = getMenuBarHeight();
export const MENU_BAR_CONTENT_PADDING = getMenuBarContentPadding();

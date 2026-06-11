import { Platform } from 'react-native';

const PUBLIC_API_BASE_URL = 'http://103.247.10.115:8000/api/v1';
const normalizeBaseUrl = (value) => value?.replace(/\/+$/, '') || null;
const platformBaseUrl =
  Platform.OS === 'web'
    ? process.env.EXPO_PUBLIC_API_BASE_URL_WEB
    : Platform.OS === 'android'
      ? process.env.EXPO_PUBLIC_API_BASE_URL_ANDROID
      : Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_API_BASE_URL_IOS
        : null;

export const API_CONFIG = {
  BASE_URL: normalizeBaseUrl(
    platformBaseUrl ||
      process.env.EXPO_PUBLIC_API_BASE_URL ||
      PUBLIC_API_BASE_URL
  ),
  TIMEOUT: 15000,
};

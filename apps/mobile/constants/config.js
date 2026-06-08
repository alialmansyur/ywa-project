import { Platform } from 'react-native';

const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const platformBaseUrl =
  Platform.OS === 'web'
    ? process.env.EXPO_PUBLIC_API_BASE_URL_WEB
    : Platform.OS === 'android'
      ? process.env.EXPO_PUBLIC_API_BASE_URL_ANDROID
      : Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_API_BASE_URL_IOS
        : null;

export const API_CONFIG = {
  BASE_URL:
    platformBaseUrl ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    `http://${defaultHost}:8000/api/v1`,
  TIMEOUT: 15000,
};

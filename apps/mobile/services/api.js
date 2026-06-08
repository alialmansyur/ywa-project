import { create } from 'axios';
import { API_CONFIG } from '../constants/config';
import * as storage from '../utils/storage';

const ERROR_MESSAGES = {
  NETWORK_UNREACHABLE: 'Tidak dapat terhubung ke server. Periksa koneksi internet atau host API.',
  NETWORK_TIMEOUT: 'Permintaan ke server timeout. Coba beberapa saat lagi.',
  UNAUTHORIZED: 'Sesi login tidak valid. Silakan login ulang.',
  FORBIDDEN: 'Anda tidak memiliki akses ke fitur ini.',
  NOT_FOUND: 'Data tidak ditemukan.',
  VALIDATION_ERROR: 'Data yang dikirim belum valid.',
  INTERNAL_SERVER_ERROR: 'Terjadi gangguan pada server. Coba beberapa saat lagi.',
  HTTP_ERROR: 'Permintaan gagal diproses.',
  AUTH_USER_NOT_FOUND: 'Pengguna tidak ditemukan.',
  AUTH_INVALID_PASSWORD: 'Password yang Anda masukkan salah.',
  AUTH_USER_INACTIVE: 'Akun tidak aktif. Silakan hubungi administrator.',
};

const normalizeApiError = (error) => {
  if (!error?.response) {
    const isTimeout = error?.code === 'ECONNABORTED';
    const code = isTimeout ? 'NETWORK_TIMEOUT' : 'NETWORK_UNREACHABLE';
    return {
      code,
      message: ERROR_MESSAGES[code],
      status: 0,
      raw: error,
    };
  }

  const status = error.response.status;
  const payload = error.response.data || {};
  const code = payload.code || (status === 401 ? 'UNAUTHORIZED' : 'HTTP_ERROR');
  const message = payload.message || ERROR_MESSAGES[code] || 'Terjadi kesalahan saat memproses permintaan.';

  return {
    code,
    message,
    status,
    errors: payload.errors || null,
    retryAfterSeconds: Number(payload.retry_after_seconds ?? error.response.headers?.['retry-after'] ?? 0) || null,
    raw: error,
  };
};

const apiClient = create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to read auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await storage.deleteItemAsync('auth_token');
        await storage.deleteItemAsync('push_token');
        const { useAuthStore } = require('../stores/auth.store');
        useAuthStore.getState().forceLoggedOut();
      } catch (e) {
        console.warn('Failed to clear auth state:', e);
      }
    }

    const normalized = normalizeApiError(error);
    if (normalized.status !== 401) {
      console.error('API Error:', {
        status: normalized.status,
        code: normalized.code,
        message: normalized.message,
        url: error.config?.url,
      });
    }

    return Promise.reject(normalized);
  }
);

export default apiClient;

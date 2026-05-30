import apiClient from './api';
import { Platform } from 'react-native';

const mapUser = (raw) => ({
  id: String(raw?.id ?? ''),
  name: raw?.name ?? '-',
  email: raw?.email ?? '-',
  phone: raw?.phone ?? undefined,
  role: raw?.roles?.[0] ?? 'operator',
  avatar: raw?.avatar_url ?? raw?.avatar ?? undefined,
  emailVerifiedAt: raw?.email_verified_at ?? null,
  dutyLocation: raw?.duty_location ?? undefined,
  createdAt: raw?.created_at ?? new Date().toISOString(),
  updatedAt: raw?.updated_at ?? new Date().toISOString(),
});

export const authService = {
  login: async (login, password) => {
    const response = await apiClient.post('/auth/login', { login, password, client_category: 'mobile' });
    return {
      token: response.data?.access_token || response.data?.token,
      user: mapUser(response.data?.user),
    };
  },

  register: async (_data) => {
    throw new Error('Register endpoint is not available on current API.');
  },

  logout: async (pushToken = null) => {
    try {
      await apiClient.post('/auth/logout', pushToken ? { fcm_token: pushToken } : {});
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return mapUser(response.data);
  },

  updateProfile: async (data) => {
    const hasAvatar = !!data?.avatar?.uri;
    let response;

    if (hasAvatar) {
      const formData = new FormData();
      if (data.name !== undefined) formData.append('name', data.name);
      if (data.phone !== undefined) formData.append('phone', data.phone);
      if (data.email !== undefined) formData.append('email', data.email);
      formData.append('_method', 'PUT');
      formData.append('avatar', {
        uri: data.avatar.uri,
        name: data.avatar.name || `avatar-${Date.now()}.jpg`,
        type: data.avatar.type || 'image/jpeg',
      });

      response = await apiClient.post('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      const payload = {
        name: data.name,
        phone: data.phone,
        email: data.email,
      };
      response = await apiClient.put('/auth/profile', payload);
    }

    return mapUser(response.data?.user || response.data);
  },

  requestEmailOtp: async (email) => {
    const response = await apiClient.post('/auth/email-otp/request', { email });
    return response.data;
  },

  verifyEmailOtp: async (email, otp) => {
    const response = await apiClient.post('/auth/email-otp/verify', { email, otp });
    return mapUser(response.data?.user || response.data);
  },

  updateFcmToken: async (token, options = {}) => {
    await apiClient.put('/auth/fcm-token', {
      fcm_token: token,
      provider: options.provider || 'expo',
      platform: options.platform || Platform.OS || null,
      device_id: options.deviceId || null,
      is_active: options.isActive ?? true,
    });
  },

  requestPasswordReset: async (email) => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, email, password, passwordConfirmation) => {
    await apiClient.post('/auth/reset-password', {
      token,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
  },

  refreshToken: async () => {
    const user = await authService.getProfile();
    const token = '';
    return { token, user };
  },

  changePassword: async (oldPassword, newPassword) => {
    await apiClient.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirmation: newPassword,
    });
  },
};

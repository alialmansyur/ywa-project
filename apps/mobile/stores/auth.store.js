import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/auth.service';
import { setupPushNotifications } from '../utils/notifications';

async function syncPushToken() {
  try {
    const token = await setupPushNotifications();
    if (!token) return;
    await authService.updateFcmToken(token, { provider: 'expo', isActive: true });
    await SecureStore.setItemAsync('push_token', token);
  } catch (error) {
    console.warn('Push token sync failed:', error);
  }
}

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  login: async (login, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(login, password);
      await SecureStore.setItemAsync('auth_token', response.token);
      await syncPushToken();
      set({
        token: response.token,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const message = error?.message || 'Login gagal';
      set({
        error: message,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      const pushToken = await SecureStore.getItemAsync('push_token');
      await authService.logout(pushToken || null);
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      try {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('push_token');
      } catch (e) {
        console.warn('Failed to delete token:', e);
      }
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  forceLoggedOut: async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('push_token');
    } catch (e) {
      console.warn('Failed to delete token:', e);
    }
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Sesi Anda telah berakhir. Silakan login kembali.',
    });
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(data);
      await SecureStore.setItemAsync('auth_token', response.token);
      set({
        token: response.token,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const message = error?.message || 'Registrasi gagal';
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        const user = await authService.getProfile();
        await syncPushToken();
        set({
          token,
          user,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.warn('Session restore failed:', error);
      try {
        await SecureStore.deleteItemAsync('auth_token');
      } catch (_e) {
        // ignore
      }
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data) => {
    try {
      await authService.updateProfile(data);
      const user = await authService.getProfile();
      set({ user });
    } catch (error) {
      set({ error: 'Failed to update profile' });
      throw error;
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    try {
      await authService.changePassword(oldPassword, newPassword);
    } catch (error) {
      set({ error: 'Failed to change password' });
      throw error;
    }
  },

  requestEmailOtp: async (email) => {
    try {
      return await authService.requestEmailOtp(email);
    } catch (error) {
      set({ error: 'Failed to request email OTP' });
      throw error;
    }
  },

  verifyEmailOtp: async (email, otp) => {
    try {
      await authService.verifyEmailOtp(email, otp);
      const user = await authService.getProfile();
      set({ user });
      return user;
    } catch (error) {
      set({ error: 'Failed to verify email OTP' });
      throw error;
    }
  },

  refreshProfile: async () => {
    try {
      const user = await authService.getProfile();
      set({ user });
      return user;
    } catch (error) {
      set({ error: 'Failed to refresh profile' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

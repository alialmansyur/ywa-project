import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { setupPushNotifications } from '../utils/notifications';
import * as storage from '../utils/storage';

async function syncPushToken() {
  try {
    const token = await setupPushNotifications();
    if (!token) return;
    await authService.updateFcmToken(token, { provider: 'expo', isActive: true });
    await storage.setItemAsync('push_token', token);
  } catch (error) {
    console.warn('Push token sync failed:', error);
  }
}

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  hasRestoredSession: false,
  isAuthenticated: false,
  error: null,

  login: async (login, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(login, password);
      await storage.setItemAsync('auth_token', response.token);
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
      const pushToken = await storage.getItemAsync('push_token');
      await authService.logout(pushToken || null);
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      try {
        await storage.deleteItemAsync('auth_token');
        await storage.deleteItemAsync('push_token');
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
      await storage.deleteItemAsync('auth_token');
      await storage.deleteItemAsync('push_token');
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
      await storage.setItemAsync('auth_token', response.token);
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
    set({ isLoading: true, hasRestoredSession: false });
    try {
      const token = await storage.getItemAsync('auth_token');
      if (token) {
        const user = await authService.getProfile();
        await syncPushToken();
        set({
          token,
          user,
          isAuthenticated: true,
        });
      } else {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.warn('Session restore failed:', error);
      try {
        await storage.deleteItemAsync('auth_token');
        await storage.deleteItemAsync('push_token');
      } catch (_e) {
        // ignore
      }
      set({
        token: null,
        user: null,
        isAuthenticated: false,
      });
    } finally {
      set({ isLoading: false, hasRestoredSession: true });
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

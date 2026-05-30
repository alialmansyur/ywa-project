import apiClient from './api';

export const notificationsService = {
  getAll: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/notifications', { params: { page, per_page: limit } });
    return response.data;
  },
  markRead: async (id) => {
    await apiClient.patch(`/notifications/${id}/read`);
  },
  markAllRead: async () => {
    await apiClient.patch('/notifications/read-all');
  },
  remove: async (id) => {
    await apiClient.delete(`/notifications/${id}`);
  },
};

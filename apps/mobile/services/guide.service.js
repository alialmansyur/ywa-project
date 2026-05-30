import apiClient from './api';

export const guideService = {
  get: async () => (await apiClient.get('/guides')).data,
};

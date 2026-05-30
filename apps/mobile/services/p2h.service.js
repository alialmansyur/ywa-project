import apiClient from './api';

export const p2hService = {
  getChecklistTemplate: async (assetId) => {
    const response = await apiClient.get(`/p2h/template/${assetId}`);
    return response.data;
  },

  getHistory: async (assetId, page = 1, limit = 10, search = null, from = null, to = null) => {
    const response = await apiClient.get('/p2h', {
      params: { asset_id: assetId, page, per_page: limit, q: search, from, to },
    });
    return response.data;
  },

  submit: async (data) => {
    const response = await apiClient.post('/p2h', data);
    return response.data;
  },

  getDetail: async (id) => {
    const response = await apiClient.get(`/p2h/${id}`);
    return response.data;
  },
};

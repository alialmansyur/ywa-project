import apiClient from './api';

export const breakdownReportService = {
  list: async ({ page = 1, perPage = 20, assetId, mine = true, search = null, from = null, to = null } = {}) => {
    const response = await apiClient.get('/breakdown-reports', {
      params: { page, per_page: perPage, asset_id: assetId, mine: mine ? 1 : 0, search, from, to },
    });
    return response.data;
  },

  create: async ({ assetId, description, locationLabel }) => {
    const response = await apiClient.post('/breakdown-reports', {
      asset_id: String(assetId),
      description,
      location_label: locationLabel,
    });
    return response.data;
  },

  update: async (id, payload) => {
    const response = await apiClient.put(`/breakdown-reports/${id}`, payload);
    return response.data;
  },

  remove: async (id) => {
    const response = await apiClient.delete(`/breakdown-reports/${id}`);
    return response.data;
  },

  process: async (id) => {
    const response = await apiClient.post(`/breakdown-reports/${id}/process`);
    return response.data;
  },
};

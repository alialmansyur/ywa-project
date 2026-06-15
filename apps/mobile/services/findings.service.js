import apiClient from './api';

export const findingsService = {
  list: async ({ page = 1, perPage = 20, assetId, mine = true, search = null, from = null, to = null } = {}) => {
    const response = await apiClient.get('/findings', {
      params: { page, per_page: perPage, asset_id: assetId, mine: mine ? 1 : 0, search, from, to },
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/findings/${id}`);
    return response.data;
  },

  create: async ({ assetId, section, description, photo }) => {
    const formData = new FormData();
    formData.append('asset_id', String(assetId));
    formData.append('section', section);
    formData.append('description', description);
    if (photo?.uri) {
      formData.append('photo', {
        uri: photo.uri,
        name: photo.name || 'temuan.jpg',
        type: photo.type || 'image/jpeg',
      });
    }

    const response = await apiClient.post('/findings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id, payload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === 'photo' && value?.uri) {
        formData.append('photo', {
          uri: value.uri,
          name: value.name || 'temuan-update.jpg',
          type: value.type || 'image/jpeg',
        });
        return;
      }
      formData.append(key, String(value));
    });

    const response = await apiClient.post(`/findings/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  remove: async (id) => {
    const response = await apiClient.delete(`/findings/${id}`);
    return response.data;
  },
};

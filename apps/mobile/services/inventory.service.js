import apiClient from './api';

export const inventoryService = {
  spareParts: async (page = 1, limit = 30, search) => {
    const response = await apiClient.get('/spare-parts', {
      params: { page, per_page: limit, search },
    });
    return response.data;
  },

  inventoryStocks: async (page = 1, limit = 200, location) => {
    const response = await apiClient.get('/inventory', {
      params: { page, per_page: limit, location },
    });
    return response.data;
  },

  inventoryTransactions: async (page = 1, limit = 50, partId) => {
    const response = await apiClient.get('/inventory/transactions', {
      params: { page, per_page: limit, part_id: partId },
    });
    return response.data;
  },
};

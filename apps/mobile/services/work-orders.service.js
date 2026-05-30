import apiClient from './api';

const GET_ALL_CACHE_TTL_MS = 15000;
const getAllInFlight = new Map();
const getAllCache = new Map();
let workOrdersCooldownUntil = 0;
let workOrdersCooldownMessage = null;
let workOrdersCooldownCode = 'RATE_LIMITED';

const buildGetAllKey = (page, limit, status, priority, search, from, to) =>
  JSON.stringify({ page, limit, status: status || null, priority: priority || null, search: search || null, from: from || null, to: to || null });

export const workOrdersService = {
  getAll: async (page = 1, limit = 20, status, priority, search, from, to) => {
    const now = Date.now();
    if (workOrdersCooldownUntil > now) {
      const retryAfterSeconds = Math.max(1, Math.ceil((workOrdersCooldownUntil - now) / 1000));
      const cooldownError = new Error(workOrdersCooldownMessage || `Too Many Attempts. Silakan coba lagi dalam ${retryAfterSeconds} detik.`);
      cooldownError.code = workOrdersCooldownCode;
      cooldownError.status = 429;
      cooldownError.retryAfterSeconds = retryAfterSeconds;
      throw cooldownError;
    }

    const key = buildGetAllKey(page, limit, status, priority, search, from, to);
    const cached = getAllCache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    if (getAllInFlight.has(key)) {
      return getAllInFlight.get(key);
    }

    const requestPromise = (async () => {
      try {
        const response = await apiClient.get('/work-orders', {
          params: { page, per_page: limit, status, priority, q: search, from, to },
        });
        const payload = response.data;
        const normalized = {
          items: payload?.data || [],
          total: payload?.total ?? 0,
          page: payload?.current_page ?? page,
          limit: payload?.per_page ?? limit,
          hasMore: (payload?.current_page ?? page) < (payload?.last_page ?? page),
        };
        getAllCache.set(key, { data: normalized, expiresAt: Date.now() + GET_ALL_CACHE_TTL_MS });
        return normalized;
      } catch (error) {
        if (error?.status === 429) {
          const retryAfterSeconds = Math.max(1, Number(error?.retryAfterSeconds || 0) || 30);
          workOrdersCooldownUntil = Date.now() + retryAfterSeconds * 1000;
          workOrdersCooldownMessage = error?.message || null;
          workOrdersCooldownCode = error?.code || 'RATE_LIMITED';
        }
        throw error;
      } finally {
        getAllInFlight.delete(key);
      }
    })();

    getAllInFlight.set(key, requestPromise);
    return requestPromise;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/work-orders/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/work-orders', data);
    return response.data?.work_order;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/work-orders/${id}`, data);
    return response.data?.work_order;
  },

  updateStatus: async (id, status, notes) => {
    const response = await apiClient.patch(`/work-orders/${id}/status`, { status, notes });
    return response.data?.work_order;
  },

  updateChecklistItem: async (id, itemId) => {
    const response = await apiClient.post(`/work-orders/${id}/checklist/${itemId}`);
    return response.data;
  },

  uploadAttachment: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/work-orders/${id}/attachment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getTimeline: async (id) => {
    const response = await apiClient.get(`/work-orders/${id}/timeline`);
    return response.data;
  },

  createBreakdown: async (data) => {
    const response = await apiClient.post('/breakdown', data);
    return response.data?.work_order;
  },

  register: async (data) => {
    const response = await apiClient.post('/work-orders/register', data);
    return response.data?.work_order || response.data?.data;
  },

  triage: async (id, data) => {
    const response = await apiClient.post(`/work-orders/${id}/triage`, data);
    return response.data?.work_order || response.data?.data;
  },
};

import apiClient from './api';

const mapAsset = (raw) => ({
  id: String(raw?.id ?? ''),
  publicUuid: raw?.public_uuid ?? raw?.qr_code ?? raw?.code ?? String(raw?.id ?? ''),
  code: raw?.code ?? '-',
  name: raw?.name ?? '-',
  assetNo: raw?.asset_no ?? raw?.sap_asset_no ?? raw?.code ?? '-',
  plateNo: raw?.veh_plate_no ?? raw?.plate_number ?? '-',
  type: raw?.category?.name ?? raw?.type ?? '-',
  location: raw?.latest_location?.address ?? undefined,
  status: raw?.status === 'breakdown' || raw?.status === 'maintenance' ? 'maintenance' : 'active',
  hm: raw?.current_hm ?? undefined,
  km: raw?.current_km ?? undefined,
  lastMaintenanceDate: raw?.last_maintenance_date ?? undefined,
  nextMaintenanceDate: raw?.next_maintenance_date ?? undefined,
  activeAssignment: raw?.active_assignment
    ? {
        id: String(raw.active_assignment.id),
        userId: String(raw.active_assignment.user_id),
        assignedAt: raw.active_assignment.assigned_at,
        user: raw.active_assignment.user
          ? {
              id: String(raw.active_assignment.user.id),
              name: raw.active_assignment.user.name,
              email: raw.active_assignment.user.email,
            }
          : null,
      }
    : null,
  specs: raw,
  createdAt: raw?.created_at ?? new Date().toISOString(),
  updatedAt: raw?.updated_at ?? new Date().toISOString(),
});

export const assetsService = {
  getAll: async (page = 1, limit = 20, search) => {
    const response = await apiClient.get('/assets', {
      params: { page, per_page: limit, search },
    });

    const payload = response.data;
    const items = (payload?.data || []).map(mapAsset);

    return {
      items,
      total: payload?.total ?? items.length,
      page: payload?.current_page ?? page,
      limit: payload?.per_page ?? limit,
      hasMore: (payload?.current_page ?? page) < (payload?.last_page ?? page),
    };
  },

  getById: async (id) => {
    const response = await apiClient.get(`/assets/${id}`);
    return mapAsset(response.data);
  },

  getDetailByRef: async (assetRef) => {
    const encodedRef = encodeURIComponent(assetRef);
    const [detail, photos, preventive, schedules, workshopHistory, documents] = await Promise.all([
      apiClient.get(`/assets/detail/${encodedRef}`),
      apiClient.get(`/assets/detail/${encodedRef}/photos`),
      apiClient.get(`/assets/detail/${encodedRef}/preventive`),
      apiClient.get(`/assets/detail/${encodedRef}/schedules`),
      apiClient.get(`/assets/detail/${encodedRef}/workshop-history`, { params: { per_page: 50 } }),
      apiClient.get(`/assets/detail/${encodedRef}/documents`),
    ]);

    return {
      asset: detail.data?.asset || null,
      photos: photos.data?.data || [],
      preventive: preventive.data?.data || null,
      schedules: schedules.data?.data || [],
      workshopHistory: workshopHistory.data?.data || [],
      documents: documents.data?.data || [],
    };
  },

  getByQR: async (qrCode) => {
    const response = await apiClient.get(`/assets/scan/${encodeURIComponent(qrCode)}`);
    return mapAsset(response.data);
  },

  updateHM: async (id, hm) => {
    const response = await apiClient.post(`/assets/${id}/hm`, { hm_value: hm });
    return response.data;
  },

  updateKM: async (id, km) => {
    const response = await apiClient.post(`/assets/${id}/hm`, { km_value: km });
    return response.data;
  },

  getHistory: async (id, page = 1, limit = 10, from = null, to = null) => {
    const response = await apiClient.get(`/assets/${id}/history`, {
      params: { page, per_page: limit, from, to },
    });
    return response.data;
  },

  getCurrentAssignment: async () => {
    const response = await apiClient.get('/assets/assignment/current');
    const assignment = response.data?.assignment;
    return assignment
      ? {
          id: String(assignment.id),
          assignedAt: assignment.assigned_at,
          asset: mapAsset(assignment.asset),
          user: assignment.user,
        }
      : null;
  },

  assignToMe: async (assetId) => {
    const response = await apiClient.post('/assets/assignment', { asset_id: assetId });
    const assignment = response.data?.assignment;
    return assignment
      ? {
          id: String(assignment.id),
          assignedAt: assignment.assigned_at,
          asset: mapAsset(assignment.asset),
          user: assignment.user,
        }
      : null;
  },

  unassignFromMe: async () => {
    const response = await apiClient.delete('/assets/assignment');
    return response.data;
  },
};

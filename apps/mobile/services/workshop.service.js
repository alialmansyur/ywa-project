import apiClient from './api';

export const workshopService = {
  controlTowerWorkOrders: async (params = {}) => (await apiClient.get('/workshop-control-tower/work-orders', { params })).data,
  controlTowerApprovalQueue: async (params = {}) => (await apiClient.get('/workshop-control-tower/approval-queue', { params })).data,
  controlTowerStepQueues: async (params = {}) => (await apiClient.get('/workshop-control-tower/step-queues', { params })).data,
  controlTowerBottlenecks: async (params = {}) => (await apiClient.get('/workshop-control-tower/bottlenecks', { params })).data,
  processTimeline: async (workOrderId) => (await apiClient.get(`/work-orders/${workOrderId}/timeline`)).data,
  processData: async (workOrderId) => (await apiClient.get(`/work-orders/${workOrderId}/process`)).data,
  startProcess: async (workOrderId) => (await apiClient.post(`/work-orders/${workOrderId}/process/start`)).data,
  stepIn: async (workOrderId, stepOrder, notes) =>
    (await apiClient.post(`/work-orders/${workOrderId}/process/steps/${stepOrder}/in`, { notes })).data,
  stepOut: async (workOrderId, stepOrder, payload) =>
    (await apiClient.post(`/work-orders/${workOrderId}/process/steps/${stepOrder}/out`, payload || {})).data,
  holdStep: async (workOrderId, stepOrder, reason) =>
    (await apiClient.post(`/work-orders/${workOrderId}/process/steps/${stepOrder}/hold`, { reason })).data,
  resumeStep: async (workOrderId, stepOrder, notes) =>
    (await apiClient.post(`/work-orders/${workOrderId}/process/steps/${stepOrder}/resume`, { notes })).data,
  complete: async (workOrderId, notes) =>
    (await apiClient.post(`/work-orders/${workOrderId}/process/complete`, { notes })).data,
};

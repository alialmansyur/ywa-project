import apiClient from './api';

export const dashboardService = {
  overview: async () => (await apiClient.get('/dashboard/overview')).data,
  workshopOperationalSummary: async () => (await apiClient.get('/dashboard/workshop-operational-summary')).data,
  upcomingSchedules: async () => (await apiClient.get('/dashboard/upcoming-schedules')).data,
  workOrderStatus: async () => (await apiClient.get('/dashboard/work-order-status')).data,
  recentActivities: async () => (await apiClient.get('/dashboard/recent-activities')).data,
  systemSettings: async (params = {}) => (await apiClient.get('/settings/system', { params })).data,
  menuAccess: async () => (await apiClient.get('/settings/menu-access', { params: { category: 'mobile' } })).data,
};

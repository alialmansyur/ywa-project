import apiClient from './api';

export const scheduleService = {
  calendar: async (year, month) => {
    const response = await apiClient.get('/schedules/calendar', { params: { year, month } });
    return response.data;
  },
  upcoming: async (days = 30) => {
    const response = await apiClient.get('/schedules/upcoming', { params: { days } });
    return response.data;
  },
};

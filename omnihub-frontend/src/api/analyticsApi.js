import api from './axios.js';

export const analyticsApi = {
  getOverview: (params) => api.get('/dashboard/analytics', { params }),
  getPlatformBreakdown: (params) => api.get('/dashboard/analytics/platforms', { params }),
  exportReport: (format, params) => api.get(`/dashboard/analytics/export/${format}`, { params, responseType: 'blob' }),
};

export default analyticsApi;

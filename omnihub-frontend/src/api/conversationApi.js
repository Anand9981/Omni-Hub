import api from './axios.js';

export const conversationApi = {
  list: (params) => api.get('/dashboard/conversations', { params }),
  getById: (id) => api.get(`/dashboard/conversations/${id}`),
  getMessages: (id) => api.get(`/dashboard/messages/${id}`),
  sendMessage: (payload) => api.post('/dashboard/messages', payload),
  toggleAutoPilot: (id, autoPilot) => api.patch(`/dashboard/conversations/${id}/autopilot`, { autoPilot }),
  updateApprovalMode: (id, approvalMode) => api.patch(`/dashboard/conversations/${id}/approval-mode`, { approvalMode }),
  markRead: (id) => api.post(`/dashboard/conversations/${id}/read`),
};

export default conversationApi;

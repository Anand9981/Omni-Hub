import api from './axios.js';

export const leadApi = {
  list: (params) => api.get('/dashboard/leads', { params }),
  getByConversation: (conversationId) => api.get(`/dashboard/leads/${conversationId}`),
  update: (conversationId, leadData) => api.put(`/dashboard/leads/${conversationId}`, leadData),
};

export default leadApi;

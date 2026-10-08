import api from './axios.js';

export const approvalApi = {
  listPending: () => api.get('/dashboard/approvals'),
  approve: (id) => api.post(`/dashboard/approvals/${id}/approve`),
  reject: (id) => api.post(`/dashboard/approvals/${id}/reject`),
  editAndApprove: (id, proposedText) => api.post(`/dashboard/approvals/${id}/edit`, { proposedText }),
};

export default approvalApi;

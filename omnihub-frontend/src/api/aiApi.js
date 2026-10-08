import api from './axios.js';

export const aiApi = {
  polishDraft: (text, context) => api.post('/ai/polish', { text, context }),
  generateReply: (conversationId) => api.post('/ai/generate', { conversationId }),
  getContext: () => api.get('/dashboard/ai-context'),
  updateContext: (data) => api.put('/dashboard/ai-context', data),
};

export default aiApi;

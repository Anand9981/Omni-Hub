import api from './axios.js';

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  verify2FA: (data) => api.post('/auth/verify-2fa', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
};

export default authApi;

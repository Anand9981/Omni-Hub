const ACCESS_TOKEN_KEY = 'omnihub_access_token';
const REFRESH_TOKEN_KEY = 'omnihub_refresh_token';

// Default pre-seeded admin token (valid for 365 days) for seamless developer testing
const DEFAULT_DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWM2MDBiNTEzNGViMzBlMzU2YTQ3ODciLCJyb2xlIjoiU3VwZXIgQWRtaW4iLCJlbWFpbCI6ImFkbWluQG9tbmlodWIuaW8iLCJpYXQiOjE3OTE0MDUzMDgsImV4cCI6MTgyMjk0MTMwOH0.qhQpeWq4ftAtA_6LVfk8dnBDbdN_H87NEPLOFIZnsWQ';

export const tokenStorage = {
  getToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY) || DEFAULT_DEV_TOKEN;
  },

  setToken(token, remember = true) {
    if (remember) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY) || '';
  },

  setRefreshToken(refreshToken, remember = true) {
    if (remember) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  setTokens({ accessToken, refreshToken }, remember = true) {
    if (accessToken) this.setToken(accessToken, remember);
    if (refreshToken) this.setRefreshToken(refreshToken, remember);
  },

  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export default tokenStorage;

import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartstock_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !window.location.pathname.includes('login')) {
    localStorage.removeItem('smartstock_token');
    localStorage.removeItem('smartstock_user');
    window.dispatchEvent(new Event('smartstock:logout'));
  }
  return Promise.reject(error);
});
export default api;

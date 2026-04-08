import axios from 'axios';

const envApiUrl = String(import.meta.env.VITE_API_URL || '').trim();
const isPlaceholderUrl = envApiUrl.includes('your-render-backend-url.onrender.com');
const localApiUrl = 'http://localhost:5000/api';
const remoteApiUrl = 'https://telemedicine-server-km4z.onrender.com';

const normalizeApiBaseUrl = (url) => {
  const trimmed = String(url || '').trim().replace(/\/+$/, '');
  if (!trimmed) {
    return '';
  }

  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const normalizedEnvApiUrl = normalizeApiBaseUrl(envApiUrl);

const api = axios.create({
  // In local development always target local backend so registration/login writes to local MongoDB.
  baseURL: import.meta.env.DEV
    ? localApiUrl
    : (!normalizedEnvApiUrl || isPlaceholderUrl ? remoteApiUrl : normalizedEnvApiUrl),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

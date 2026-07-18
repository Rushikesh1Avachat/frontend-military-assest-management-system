import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (config.method === 'get') {
    config.params = {
      ...(config.params || {}),
      _t: Date.now(),
    };
  }
  return config;
});

export const setAuthToken = (jwtToken) => {
  if (jwtToken) {
    api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

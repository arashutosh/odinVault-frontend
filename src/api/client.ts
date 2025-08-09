import axios from 'axios';
import { getToken, removeToken } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to normalize API shape and handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    // If backend wraps as { success, data }, unwrap to inner data
    if (response && response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = (response.data as any).data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
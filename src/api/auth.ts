import { apiClient } from './client';
import { AuthResponse, LoginCredentials, RegisterCredentials, GoogleAuthCredentials, User } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', credentials);
    return response.data;
  },

  googleAuth: async (credentials: GoogleAuthCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/google', credentials);
    return response.data;
  },

  getGoogleAuthUrl: async (): Promise<{ authUrl: string }> => {
    const response = await apiClient.get('/auth/google/url');
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },
};
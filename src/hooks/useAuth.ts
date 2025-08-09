import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { setToken, removeToken, isAuthenticated, getToken } from '../utils/auth';
import { LoginCredentials, RegisterCredentials, GoogleAuthCredentials } from '../types';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const queryClient = useQueryClient();

  const token = getToken();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: authApi.getProfile,
    enabled: !!token,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(['user'], data.user);
      toast.success('Welcome back!');
      window.location.replace('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(['user'], data.user);
      toast.success('Account created successfully!');
      window.location.replace('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  const googleAuthMutation = useMutation({
    mutationFn: authApi.googleAuth,
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(['user'], data.user);
      toast.success('Welcome!');
      window.location.replace('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Google authentication failed');
    },
  });

  const logout = () => {
    removeToken();
    queryClient.clear();
    toast.success('Logged out successfully');
    window.location.replace('/login');
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!token && isAuthenticated(),
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    googleAuth: googleAuthMutation.mutate,
    logout,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isGoogleAuthLoading: googleAuthMutation.isPending,
  };
};
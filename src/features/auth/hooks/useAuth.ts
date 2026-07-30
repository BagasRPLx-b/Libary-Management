import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';
import type { LoginFormData, RegisterFormData } from '@/lib/validations/auth.schema';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'Admin' | 'Staff' | 'Member';
}

export interface LoginResponse {
  message?: string;
  access_token?: string;
  token?: string;
  user?: User;
  data?: any;
}

const loginUser = async (data: LoginFormData): Promise<{ token: string; user: User }> => {
  const response = await apiClient.post('/login', data);
  const token = response.data?.access_token || response.data?.token || response.data?.data?.access_token;
  
  if (!token) {
    throw new Error('Token tidak ditemukan dalam respon login.');
  }

  // Fetch user data using GET /user after receiving token
  const userResponse = await apiClient.get('/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const user = userResponse.data?.data || userResponse.data;

  return { token, user };
};

const registerUser = async (data: RegisterFormData): Promise<any> => {
  const { confirmPassword, ...payload } = data;
  const response = await apiClient.post('/register', {
    ...payload,
    password_confirmation: confirmPassword,
  });
  return response.data;
};

export const useLogin = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: ({ token, user }) => {
      if (token && user) {
        const userData: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
        };
        
        login(userData, token);
      }
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
  });
};
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';
import type { LoginFormData, RegisterFormData } from '@/lib/validations/auth.schema';

interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'Admin' | 'Staff' | 'Member';
  };
}

const loginUser = async (data: LoginFormData): Promise<AuthResponse> => {
  const response = await apiClient.post('/login', data); // endpoint: /api/v1/login
  return response.data;
};

export const useLogin = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      login(data.user, data.access_token);
    },
  });
};

// ... setelah useLogin
const registerUser = async (data: RegisterFormData) => {
  const { confirmPassword, ...payload } = data;
  const response = await apiClient.post('/register', payload);
  return response.data;
};

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
  });
};
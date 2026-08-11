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

const loginUser = async (data: LoginFormData): Promise<{ token: string; user: User }> => {
  const response = await apiClient.post('/login', data);
  const token = response.data?.access_token || response.data?.token || response.data?.data?.access_token;
  
  if (!token) {
    throw new Error('Token tidak ditemukan dalam respon login.');
  }

  let user = response.data?.user || response.data?.data?.user || null;
  
  if (!user) {
    const userResponse = await apiClient.get('/user');
    user = userResponse.data?.data || userResponse.data;
  }

  if (!user) {
    throw new Error('Gagal mengambil data profil pengguna.');
  }

  // Normalisasi role
  if (user && user.role) {
    user.role = (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) as User['role'];
  }

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
          name: user.name || 'User',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || 'Member',
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
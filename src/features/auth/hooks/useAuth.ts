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
  console.log('📡 Sending login request...');
  const response = await apiClient.post('/login', data);
  console.log('📡 Login response:', response.data);
  
  const token = response.data?.access_token || response.data?.token || response.data?.data?.access_token;
  
  if (!token) {
    throw new Error('Token tidak ditemukan dalam respon login.');
  }

  // 🔥 SKIP GET /user dulu, pakai data dari response login
  let user = response.data?.user || response.data?.data?.user || null;
  
  // Kalau response login tidak ada user, baru coba GET /user
  if (!user) {
    try {
      console.log('📡 Fetching /user...');
      const userResponse = await apiClient.get('/user');
      user = userResponse.data?.data || userResponse.data;
      console.log('📡 User response:', user);
    } catch (e) {
      console.error('❌ Gagal fetch /user:', e);
      // Fallback user
      user = {
        id: 0,
        name: data.email.split('@')[0],
        email: data.email,
        role: 'Member', // Default
      };
    }
  }

  // Normalisasi role
  if (user && user.role) {
    user.role = user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();
  }

  console.log('✅ Final user:', user);
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
      console.log('✅ Mutation success - token:', token, 'user:', user);
      
      if (token && user) {
        const userData: User = {
          id: user.id || 0,
          name: user.name || 'User',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || 'Member',
        };
        
        console.log('✅ Saving to context:', userData);
        login(userData, token);
      } else {
        console.error('❌ Token atau user kosong!');
      }
    },
    onError: (error) => {
      console.error('❌ Login mutation error:', error);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
  });
};
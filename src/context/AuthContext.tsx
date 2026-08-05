import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/lib/api/client';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'Admin' | 'Staff' | 'Member';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, accessToken: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Inisialisasi dari localStorage
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        return JSON.parse(storedUser);
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e);
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
      return storedToken;
    }
    return null;
  });

  // Debug saat mount
  useEffect(() => {
    console.log('🔵 AuthContext mounted');
    console.log('🔵 Token from localStorage:', token);
    console.log('🔵 User from localStorage:', user);
    console.log('🔵 isAuthenticated:', !!token && !!user);
  }, []);

  const login = (userData: User, accessToken: string) => {
    console.log('🔵 login() called');
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await apiClient.post('/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  };

  const isAuthenticated = !!token && !!user;

  console.log('🟢 AuthContext render - isAuthenticated:', isAuthenticated);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
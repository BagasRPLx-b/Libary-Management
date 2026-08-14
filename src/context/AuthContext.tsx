/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
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

const STORAGE_KEYS = {
  TOKEN: 'access_token',
  USER: 'user',
} as const;

const readStorageValue = (key: string) => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const value = window.sessionStorage.getItem(key);
    return value && value !== 'undefined' && value !== 'null' ? value : null;
  } catch {
    return null;
  }
};

const writeStorageValue = (key: string, value: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Ignore storage quota or browser restrictions.
  }
};

const removeStorageValue = (key: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore storage access issues.
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = readStorageValue(STORAGE_KEYS.USER);
    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      removeStorageValue(STORAGE_KEYS.USER);
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => readStorageValue(STORAGE_KEYS.TOKEN));

  const login = (userData: User, accessToken: string) => {
    setUser(userData);
    setToken(accessToken);
    writeStorageValue(STORAGE_KEYS.TOKEN, accessToken);
    writeStorageValue(STORAGE_KEYS.USER, JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await apiClient.post('/logout');
    } catch {
      // Ignore logout API error
    } finally {
      setUser(null);
      setToken(null);
      removeStorageValue(STORAGE_KEYS.TOKEN);
      removeStorageValue(STORAGE_KEYS.USER);
    }
  };

  const isAuthenticated = !!token && !!user;

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
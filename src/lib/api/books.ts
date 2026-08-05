// src/lib/api/books.ts
import apiClient from './client';
import { Book, Category } from '@/features/books/hooks/useBooks';

export const bookApi = {
  getAll: (params?: {
    search?: string;
    category_id?: string;
    author?: string;
    per_page?: number;
    page?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.set('search', params.search);
    if (params?.category_id) queryParams.set('category_id', params.category_id);
    if (params?.author) queryParams.set('author', params.author);
    if (params?.per_page) queryParams.set('per_page', String(params.per_page));
    if (params?.page) queryParams.set('page', String(params.page));
    
    const url = `/books${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('📡 API URL:', url);
    return apiClient.get(url);
  },

  getById: (id: number) => {
    return apiClient.get(`/books/${id}`);
  },

  create: (data: any) => {
    return apiClient.post('/books', data);
  },

  update: (id: number, data: any) => {
    return apiClient.put(`/books/${id}`, data);
  },

  delete: (id: number) => {
    return apiClient.delete(`/books/${id}`);
  },
};

export const categoryApi = {
  getAll: () => {
    console.log('📡 Calling GET /categories');
    return apiClient.get('/categories');
  },
  getById: (id: number) => {
    return apiClient.get(`/categories/${id}`);
  },
};

export const authorApi = {
  getAll: () => {
    console.log('📡 Calling GET /authors');
    return apiClient.get('/authors');
  },
};
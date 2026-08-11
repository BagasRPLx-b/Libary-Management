import apiClient from './client';
import type { Book, BookFormData, BookParams } from '@/types';

export const bookApi = {
  getAll: (params?: BookParams) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.set('search', params.search);
    if (params?.category_id) queryParams.set('category_id', params.category_id);
    if (params?.author) queryParams.set('author', params.author);
    if (params?.per_page) queryParams.set('per_page', String(params.per_page));
    if (params?.page) queryParams.set('page', String(params.page));

    const url = `/books${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(url);
  },

  getById: (id: number) => apiClient.get<{ data: Book } | Book>(`/books/${id}`),

  create: (data: BookFormData) => apiClient.post('/books', data),

  update: (id: number, data: Partial<BookFormData>) => apiClient.put(`/books/${id}`, data),

  delete: (id: number) => apiClient.delete(`/books/${id}`),
};

export const categoryApi = {
  getAll: () => apiClient.get('/categories'),
  getById: (id: number) => apiClient.get(`/categories/${id}`),
};

export const authorApi = {
  getAll: () => apiClient.get('/authors'),
};

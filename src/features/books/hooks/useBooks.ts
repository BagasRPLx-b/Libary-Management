import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string | { id: string | number; name: string; slug?: string; created_at?: string; updated_at?: string };
  publisher?: string;
  year?: number;
  pages?: number;
  language?: string;
  description?: string;
  available_copies: number;
  total_copies?: number;
  created_at?: string;
  updated_at?: string;
}

interface BookParams {
  search?: string;
  author?: string;
  category?: string;
}

interface BooksResponse {
  data: Book[];
}

interface BookResponse {
  data: Book;
}

// GET /books
export const useBooks = (params?: BookParams) => {
  return useQuery({
    queryKey: ['books', params],
    queryFn: async () => {
      const response = await apiClient.get<BooksResponse | Book[]>('/books', { params });
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data?.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

// GET /books/:id
export const useBook = (id: number) => {
  return useQuery({
    queryKey: ['books', id],
    queryFn: async () => {
      const response = await apiClient.get<BookResponse | Book>(`/books/${id}`);
      if ('data' in response.data && response.data.data) {
        return response.data.data;
      }
      return response.data as Book;
    },
    enabled: !!id,
  });
};

// POST /books
export const useCreateBook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newBook: any) => {
      const { data } = await apiClient.post<BookResponse>('/books', newBook);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

// PUT /books/:id
export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      const { data } = await apiClient.put<BookResponse>(`/books/${id}`, updateData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

// DELETE /books/:id
export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/books/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};
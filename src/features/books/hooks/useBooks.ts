import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookApi, categoryApi, authorApi } from '@/lib/api/books';
import type { Book, BookFormData, BooksResponse, Category, BookParams } from '@/types';

function extractData<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.categories)) return obj.categories as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.result)) return obj.result as T[];
  }
  return [];
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const response = await categoryApi.getAll();
      return extractData<Category>(response.data);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const useAuthors = () => {
  return useQuery({
    queryKey: ['authors'],
    queryFn: async (): Promise<string[]> => {
      const response = await authorApi.getAll();
      return extractData<string>(response.data);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const useBooks = (params?: BookParams) => {
  return useQuery({
    queryKey: ['books', params],
    queryFn: async (): Promise<BooksResponse> => {
      const response = await bookApi.getAll(params);
      const data = response.data;

      if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
        return {
          data: data.data,
          current_page: data.current_page || 1,
          last_page: data.last_page || 1,
          per_page: data.per_page || 12,
          total: data.total || 0,
        };
      }

      if (Array.isArray(data)) {
        return {
          data,
          current_page: 1,
          last_page: 1,
          per_page: data.length,
          total: data.length,
        };
      }

      return { data: [], current_page: 1, last_page: 1, per_page: 12, total: 0 };
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const useBook = (id: number) => {
  return useQuery({
    queryKey: ['books', id],
    queryFn: async (): Promise<Book> => {
      const response = await bookApi.getById(id);
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data.data;
      }
      return response.data as Book;
    },
    enabled: !!id,
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newBook: BookFormData) => {
      const response = await bookApi.create(newBook);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['authors'] });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: BookFormData & { id: number }) => {
      const response = await bookApi.update(id, updateData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['authors'] });
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await bookApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['authors'] });
    },
  });
};

export type { Book, Category, BooksResponse, BookFormData };

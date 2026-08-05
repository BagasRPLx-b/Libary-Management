import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookApi, categoryApi, authorApi } from '@/lib/api/books';

export interface Book {
  id: number;
  category_id: number;
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  total_copies: number;
  available_copies: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

interface BookParams {
  search?: string;
  author?: string;
  category_id?: string;
  per_page?: number;
}

// ─── Helper: Extract Data ────────────────────────────────
function extractData<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.categories)) return data.categories;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.result)) return data.result;
  }
  return [];
}

// ─── GET /categories ─────────────────────────────────────
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

// ─── GET /authors ─────────────────────────────────────────
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

// ─── GET /books ──────────────────────────────────────────
export const useBooks = (params?: BookParams) => {
  return useQuery({
    queryKey: ['books', params],
    queryFn: async (): Promise<Book[]> => {
      const response = await bookApi.getAll(params);
      return extractData<Book>(response.data);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

// ─── GET /books/:id ──────────────────────────────────────
export const useBook = (id: number) => {
  return useQuery({
    queryKey: ['books', id],
    queryFn: async (): Promise<Book> => {
      const response = await bookApi.getById(id);
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as any).data;
      }
      return response.data as Book;
    },
    enabled: !!id,
  });
};

// ─── POST /books ─────────────────────────────────────────
export const useCreateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newBook: any) => {
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

// ─── PUT /books/:id ──────────────────────────────────────
export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
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

// ─── DELETE /books/:id ───────────────────────────────────
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
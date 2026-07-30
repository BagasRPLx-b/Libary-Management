import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import type { Book } from '@/features/books/hooks/useBooks';

export interface Transaction {
  id: number;
  member: string;
  book: string;
  type: 'Issue' | 'Return';
  time: string;
}

interface ScanBookResponse {
  data: Book;
}

export const useTodayTransactions = () => {
  return useQuery({
    queryKey: ['circulation', 'today'],
    queryFn: async () => {
      const response = await apiClient.get<Transaction[] | { data: Transaction[] }>('/circulation/today');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data?.data || [];
    },
  });
};

export const useScanBook = (barcode: string) => {
  return useQuery({
    queryKey: ['circulation', 'scan', barcode],
    queryFn: async () => {
      const response = await apiClient.get<ScanBookResponse | Book>(`/books/scan/${barcode}`);
      if ('data' in response.data && response.data.data) {
        return response.data.data;
      }
      return response.data as Book;
    },
    enabled: !!barcode,
  });
};

export const useIssueBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { book_id: number; member_id?: number }) => {
      const { data } = await apiClient.post('/loans/issue', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circulation'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['my-loans'] });
    },
  });
};

export const useReturnBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { book_id?: number; loan_id?: number }) => {
      const { data } = await apiClient.post('/loans/return', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circulation'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['my-loans'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};
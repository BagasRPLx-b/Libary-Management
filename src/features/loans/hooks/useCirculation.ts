// src/features/loans/hooks/useCirculation.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { issueBook, returnBook } from '@/lib/api/loans';

export interface TodayTransaction {
  id: number;
  member: string;
  book: string;
  type: 'Issue' | 'Return';
  time: string;
  status: string;
}

const fetchTodayTransactions = async (): Promise<TodayTransaction[]> => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const response = await apiClient.get('/transactions', { params: { date: today } });
    const data = response.data;

    if (data && typeof data === 'object') {
      const allTransactions = [
        ...(Array.isArray(data.issued) ? data.issued : []),
        ...(Array.isArray(data.returned) ? data.returned : []),
      ];

      const uniqueTransactions = allTransactions.filter(
        (item, index, self) => index === self.findIndex((t) => t.id === item.id)
      );

      const sortedTransactions = uniqueTransactions.sort((a, b) => {
        const dateA = new Date(a.created_at || a.borrowed_at).getTime();
        const dateB = new Date(b.created_at || b.borrowed_at).getTime();
        return dateB - dateA;
      });

      return sortedTransactions.map((item: any) => ({
        id: item.id,
        member: item.member?.name || 'Unknown',
        book: item.book?.title || 'Unknown',
        type: item.status === 'active' ? 'Issue' : 'Return',
        time: item.created_at
          ? new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : '-',
        status: item.status,
      }));
    }

    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;

    return [];
  } catch {
    return [];
  }
};

export const useTodayTransactions = () => {
  return useQuery({
    queryKey: ['transactions', 'today'],
    queryFn: fetchTodayTransactions,
    staleTime: 1000 * 60 * 5,
  });
};

export const useIssueBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { book_id: number; member_id: number }) => issueBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useReturnBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loanId: number) => returnBook(loanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};
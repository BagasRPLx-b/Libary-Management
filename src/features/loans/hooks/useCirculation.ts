import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import {
  getActiveLoans,
  getBookActiveLoans,
  issueBook,
  returnBook,
  scanBook,
} from '@/lib/api/loans';
import type { ActiveLoan, ReturnBookResponse, ScannedBook, TodayTransaction } from '@/types';

interface RawTransaction {
  id: number;
  member?: { name?: string; user_id?: number };
  book?: { title?: string };
  status?: string;
  created_at?: string;
  borrowed_at?: string;
}

const fetchTodayTransactions = async (): Promise<TodayTransaction[]> => {
  const today = new Date().toISOString().split('T')[0];
  const response = await apiClient.get<{ issued?: RawTransaction[]; returned?: RawTransaction[] } | RawTransaction[]>(
    '/transactions',
    { params: { date: today } }
  );
  const data = response.data;

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const allTransactions = [
      ...(Array.isArray(data.issued) ? data.issued : []),
      ...(Array.isArray(data.returned) ? data.returned : []),
    ];

    const uniqueTransactions = allTransactions.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    );

    const sortedTransactions = uniqueTransactions.sort((a, b) => {
      const dateA = new Date(a.created_at || a.borrowed_at || 0).getTime();
      const dateB = new Date(b.created_at || b.borrowed_at || 0).getTime();
      return dateB - dateA;
    });

    return sortedTransactions.map((item) => ({
      id: item.id,
      member: item.member?.name || 'Unknown',
      book: item.book?.title || 'Unknown',
      type: item.status === 'active' ? 'Issue' as const : 'Return' as const,
      time: item.created_at
        ? new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '-',
      status: item.status || '',
    }));
  }

  if (Array.isArray(data)) {
    return data as unknown as TodayTransaction[];
  }

  return [];
};

export const useTodayTransactions = () => {
  return useQuery({
    queryKey: ['transactions', 'today'],
    queryFn: fetchTodayTransactions,
    staleTime: 1000 * 60 * 5,
  });
};

export const useActiveLoans = () => {
  return useQuery({
    queryKey: ['loans', 'active', 'all'],
    queryFn: () => getActiveLoans({ per_page: 100 }),
    staleTime: 1000 * 60 * 2,
  });
};

export const useScanBook = () => {
  return useMutation({
    mutationFn: async ({ isbn, mode }: { isbn: string; mode: 'issue' | 'return' }) => {
      const book = await scanBook(isbn);

      if (mode === 'return') {
        const activeLoans = await getBookActiveLoans(book.id);
        if (activeLoans.length === 0) {
          throw new Error('Tidak ada peminjaman aktif untuk buku ini.');
        }
        return { ...book, active_loans: activeLoans } as ScannedBook;
      }

      if (mode === 'issue' && book.available_copies === 0) {
        throw new Error(`Stok buku "${book.title}" habis.`);
      }

      return book as ScannedBook;
    },
  });
};

export const useIssueBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { book_id: number; member_id: number }) => issueBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
};

export const useReturnBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loanId: number): Promise<ReturnBookResponse> => returnBook(loanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
};

export type { TodayTransaction, ActiveLoan, ScannedBook };

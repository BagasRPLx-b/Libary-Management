// src/features/loans/hooks/useCirculation.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, issueBook, returnBook } from '@/lib/api/loans';

export const useTodayTransactions = () => {
  return useQuery({
    queryKey: ['transactions', 'today'],
    queryFn: () => getTransactions({ date: new Date().toISOString().split('T')[0] }),
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
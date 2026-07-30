import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

interface Loan {
  id: number;
  book: { id: number; title: string };
  borrow_date: string;
  due_date: string;
  return_date?: string;
  status: 'active' | 'overdue' | 'returned';
  fine_amount?: number;
}

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await apiClient.get('/profile');
      return data.data;
    },
  });
};

export const useMyActiveLoans = () => {
  return useQuery({
    queryKey: ['my-loans', 'active'],
    queryFn: async () => {
      const { data } = await apiClient.get('/profile/loans');
      return data.data as Loan[];
    },
  });
};

export const useMyLoanHistory = () => {
  return useQuery({
    queryKey: ['my-loans', 'history'],
    queryFn: async () => {
      const { data } = await apiClient.get('/profile/history');
      return data.data as Loan[];
    },
  });
};
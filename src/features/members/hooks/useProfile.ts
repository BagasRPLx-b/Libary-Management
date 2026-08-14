import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { memberApi } from '@/lib/api/members';
import { useAuth } from '@/context/AuthContext';
import type { Loan, Profile } from '@/types';

interface RawTransaction {
  id: number;
  member_id: number;
  book_id: number;
  member?: { user_id?: number; name?: string };
  book?: { id?: number; title?: string; author?: string; category?: { name?: string } | string };
  borrowed_at?: string;
  due_date?: string;
  returned_at?: string | null;
  status: string;
  fine_amount?: string | number;
  created_at: string;
  updated_at: string;
}

function mapTransactionToLoan(item: RawTransaction): Loan {
  return {
    id: item.id,
    member_id: item.member_id,
    book_id: item.book_id,
    book: {
      id: item.book?.id || 0,
      title: item.book?.title || 'Unknown',
      author: item.book?.author,
      category: typeof item.book?.category === 'object'
        ? item.book.category.name
        : item.book?.category,
    },
    borrow_date: item.borrowed_at || item.created_at,
    due_date: item.due_date || '',
    return_date: item.returned_at || null,
    status: item.status as Loan['status'],
    fine_amount: parseFloat(String(item.fine_amount)) || 0,
    created_at: item.created_at,
    updated_at: item.updated_at,
    borrowed_at: item.borrowed_at,
    returned_at: item.returned_at || undefined,
  };
}

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<Profile> => {
      const response = await apiClient.get<Profile>('/profile');
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useMyLoans = (status?: 'active' | 'returned' | 'overdue') => {
  const { user } = useAuth();
  const userId = user?.id;
  const role = user?.role?.toLowerCase();

  return useQuery({
    queryKey: ['my-loans', status, userId, role],
    queryFn: async (): Promise<Loan[]> => {
      if (!userId) return [];

      if (role === 'member') {
        const profileResponse = await apiClient.get<Profile>('/profile');
        const profileData = profileResponse.data;

        if (profileData.loans && Array.isArray(profileData.loans)) {
          let loans = profileData.loans;
          if (status) {
            loans = loans.filter((loan) => loan.status === status);
          }
          return loans;
        }
        return [];
      }

      if (role === 'admin' || role === 'staff') {
        const today = new Date().toISOString().split('T')[0];
        const response = await apiClient.get<{ issued?: RawTransaction[]; returned?: RawTransaction[] }>(
          '/transactions',
          { params: { date: today } }
        );
        const data = response.data;

        const allTransactions = [
          ...(Array.isArray(data?.issued) ? data.issued : []),
          ...(Array.isArray(data?.returned) ? data.returned : []),
        ];

        const userLoans = allTransactions.filter(
          (item) => item.member?.user_id === userId
        );

        let filteredLoans = userLoans;
        if (status) {
          filteredLoans = userLoans.filter((loan) => loan.status === status);
        }

        return filteredLoans.map(mapTransactionToLoan);
      }

      return [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useMyActiveLoans = () => useMyLoans('active');

export const useMyLoanHistory = () => useMyLoans('returned');

export const useMemberHistory = (userId: number) => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  const isAdminOrStaff = role === 'admin' || role === 'staff';

  return useQuery({
    queryKey: ['members', userId, 'history'],
    queryFn: (): Promise<Loan[]> => memberApi.getHistory(userId),
    enabled: !!userId && isAdminOrStaff,
    staleTime: 1000 * 60 * 5,
  });
};

export type { Profile, Loan };

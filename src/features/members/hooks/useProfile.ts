// src/features/members/hooks/useProfile.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';

export interface Profile {
  id: number;
  name: string;
  email: string;
  phone: string;
  member_code: string;
  status: 'active' | 'suspended';
  joined_date?: string;
  valid_until?: string;
  total_borrowed?: number;
  active_fine?: number;
  active_loans_count?: number;
  loans?: Loan[];
  active_loans?: number;
}

export interface Loan {
  id: number;
  member_id: number;
  book_id: number;
  book: {
    id: number;
    title: string;
    author?: string;
    category?: string;
  };
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: 'active' | 'returned' | 'overdue';
  fine_amount: number;
  created_at: string;
  updated_at: string;
}

// ─── GET /profile (SEMUA ROLE BISA) ──────────────────────
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<Profile> => {
      const response = await apiClient.get('/profile');
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

// ─── GET peminjaman user yang login ──────────────────────
// 🔥 MEMBER: pakai /profile (jika ada loans)
// 🔥 ADMIN/STAFF: pakai /transactions
export const useMyLoans = (status?: 'active' | 'returned' | 'overdue') => {
  const { user } = useAuth();
  const userId = user?.id;
  const role = user?.role?.toLowerCase(); // ✅ lowercase comparison

  return useQuery({
    queryKey: ['my-loans', status, userId, role],
    queryFn: async (): Promise<Loan[]> => {
      try {
        if (!userId) return [];

        // ✅ Jika MEMBER: Ambil dari /profile
        if (role === 'member') {
          const profileResponse = await apiClient.get('/profile');
          const profileData = profileResponse.data;
          
          if (profileData.loans && Array.isArray(profileData.loans)) {
            let loans = profileData.loans;
            if (status) {
              loans = loans.filter((loan: any) => loan.status === status);
            }
            return loans;
          }
          
          // Jika /profile belum punya loans, return empty array
          // ⚠️ Backend akan tambahkan loans di /profile nanti
          return [];
        }

        // ✅ Jika ADMIN/STAFF: Ambil dari /transactions
        if (role === 'admin' || role === 'staff') {
          const today = new Date().toISOString().split('T')[0];
          const response = await apiClient.get('/transactions', { params: { date: today } });
          const data = response.data;

          const allTransactions = [
            ...(Array.isArray(data?.issued) ? data.issued : []),
            ...(Array.isArray(data?.returned) ? data.returned : []),
          ];

          // Filter berdasarkan user_id
          const userLoans = allTransactions.filter(
            (item: any) => item.member?.user_id === userId
          );

          let filteredLoans = userLoans;
          if (status) {
            filteredLoans = userLoans.filter((loan: any) => loan.status === status);
          }

          return filteredLoans.map((item: any) => ({
            id: item.id,
            member_id: item.member_id,
            book_id: item.book_id,
            book: {
              id: item.book?.id || 0,
              title: item.book?.title || 'Unknown',
              author: item.book?.author,
              category: item.book?.category?.name || item.book?.category,
            },
            borrow_date: item.borrowed_at,
            due_date: item.due_date,
            return_date: item.returned_at || null,
            status: item.status,
            fine_amount: parseFloat(item.fine_amount) || 0,
            created_at: item.created_at,
            updated_at: item.updated_at,
          }));
        }

        return [];
      } catch (error) {
        console.error('❌ Error fetching my loans:', error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
};

// ─── BACKWARD COMPATIBILITY ──────────────────────────────
export const useMyActiveLoans = () => {
  return useMyLoans('active');
};

export const useMyLoanHistory = () => {
  return useMyLoans('returned');
};

// ─── Untuk Admin/Staff: lihat history member lain ──────
export const useMemberHistory = (userId: number) => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  const isAdminOrStaff = role === 'admin' || role === 'staff';

  return useQuery({
    queryKey: ['members', userId, 'history'],
    queryFn: async (): Promise<Loan[]> => {
      if (!isAdminOrStaff) {
        throw new Error('Anda tidak memiliki akses untuk melihat history member lain.');
      }
      const response = await apiClient.get(`/members/${userId}/history`);
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId && isAdminOrStaff,
    staleTime: 1000 * 60 * 5,
  });
};
// src/features/reports/hooks/useReports.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

export interface OverdueLoan {
  id: number;
  member_id: number;
  book_id: number;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  fine_amount: string;
  estimated_fine: number;
  status: string;
  created_at: string;
  updated_at: string;
  member: {
    id: number;
    member_code: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    user_id: number;
  };
  book: {
    id: number;
    category_id: number;
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    publication_year: number;
    total_copies: number;
    available_copies: number;
  };
}

export interface OverdueResponse {
  count: number;
  overdue_loans: OverdueLoan[];
}

// ✅ HANYA SATU DEFINISI - Gunakan yang ini
export const useOverdueLoans = (search?: string) => {
  return useQuery({
    queryKey: ['reports', 'overdue', search],
    queryFn: async (): Promise<OverdueLoan[]> => {
      const response = await apiClient.get('/reports/overdue', {
        params: search ? { search } : {},
      });
      
      const data = response.data as OverdueResponse;
      const loans = data?.overdue_loans || (data as any)?.data || [];
      
      return Array.isArray(loans) ? loans : [];
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
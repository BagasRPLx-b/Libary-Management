import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

interface OverdueLoan {
  id: number;
  member: string;
  book: string;
  due_date: string;
  fine_amount: number;
}

export const useOverdueLoans = (search?: string) => {
  return useQuery({
    queryKey: ['reports', 'overdue', search],
    queryFn: async () => {
      const response = await apiClient.get<OverdueLoan[] | { data: OverdueLoan[] }>('/reports/overdue', {
        params: search ? { search } : {},
      });
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data?.data || [];
    },
  });
};
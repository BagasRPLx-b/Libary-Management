// src/features/reports/hooks/useReports.ts
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/lib/api/reports';
import type { OverdueLoan } from '@/types';

export const useOverdueLoans = (search?: string) => {
  return useQuery({
    queryKey: ['reports', 'overdue', search],
    queryFn: (): Promise<OverdueLoan[]> => reportApi.getOverdueLoans(search),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

// ✅ TAMBAHKAN INI
export const useMemberPenalty = (params?: { search?: string; page?: number; per_page?: number }) => {
  return useQuery({
    queryKey: ['reports', 'member-penalty', params],
    queryFn: () => reportApi.getMemberPenalty(params),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export type { OverdueLoan };
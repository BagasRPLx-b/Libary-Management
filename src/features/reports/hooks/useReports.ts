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

export type { OverdueLoan };

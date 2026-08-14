// src/lib/api/reports.ts
import apiClient from './client';
import type { MemberPenaltySummaryResponse, OverdueLoan, OverdueResponse } from '@/types';

export const reportApi = {
  getOverdueLoans: async (search?: string): Promise<OverdueLoan[]> => {
    const response = await apiClient.get<OverdueResponse | { data: OverdueLoan[] }>('/reports/overdue', {
      params: search ? { search } : {},
    });
    const data = response.data;
    if ('overdue_loans' in data && Array.isArray(data.overdue_loans)) {
      return data.overdue_loans;
    }
    if ('data' in data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  },

  getMemberPenalty: async (params?: { search?: string; page?: number; per_page?: number }): Promise<MemberPenaltySummaryResponse> => {
    const response = await apiClient.get<MemberPenaltySummaryResponse>('/reports/member-penalty', { params });
    return response.data;
  },
};
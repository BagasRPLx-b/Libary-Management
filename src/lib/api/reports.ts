import apiClient from './client';
import { OverdueLoan, ApiResponse } from './types';

export const getOverdueLoans = async (params?: any): Promise<OverdueLoan[]> => {
  const response = await apiClient.get<ApiResponse<OverdueLoan[]> | OverdueLoan[]>('/reports/overdue', { params });
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.data;
};

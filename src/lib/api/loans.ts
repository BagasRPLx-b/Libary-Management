import apiClient from './client';
import { Transaction, ApiMessageResponse } from './types';

export const getTransactions = async (params?: { date?: string }): Promise<Transaction[]> => {
  const response = await apiClient.get<{ data: Transaction[] } | Transaction[]>('/transactions', { params });
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.data;
};

export const scanBook = async (isbn: string): Promise<any> => {
  const response = await apiClient.get(`/books/scan/${isbn}`);
  return response.data;
};

export const issueBook = async (data: { book_id: string | number; member_id: string | number }): Promise<ApiMessageResponse> => {
  const response = await apiClient.post<ApiMessageResponse>('/circulation/issue', data);
  return response.data;
};

export const returnBook = async (id: string | number): Promise<{ message: string; fine?: number }> => {
  const response = await apiClient.post<{ message: string; fine?: number }>(`/circulation/return/${id}`);
  return response.data;
};

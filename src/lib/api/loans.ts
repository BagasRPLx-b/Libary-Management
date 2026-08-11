import apiClient from './client';
import type {
  ActiveLoan,
  ApiMessageResponse,
  ReturnBookResponse,
  ScannedBook,
  Transaction,
} from '@/types';

export const getTransactions = async (params?: { date?: string }): Promise<Transaction[]> => {
  const response = await apiClient.get<{ data: Transaction[] } | Transaction[]>('/transactions', { params });
  if (Array.isArray(response.data)) return response.data;
  return response.data.data;
};

export const scanBook = async (isbn: string): Promise<ScannedBook> => {
  const response = await apiClient.get<ScannedBook>(`/books/scan/${isbn}`);
  return response.data;
};

export const getActiveLoans = async (params?: { per_page?: number }): Promise<ActiveLoan[]> => {
  const response = await apiClient.get<{ data: ActiveLoan[] } | ActiveLoan[]>('/loans', {
    params: { status: 'active', per_page: params?.per_page ?? 100 },
  });
  const data = response.data;
  if (Array.isArray(data)) return data;
  return data.data ?? [];
};

export const getBookActiveLoans = async (bookId: number): Promise<ActiveLoan[]> => {
  const response = await apiClient.get<{ data: ActiveLoan[] } | ActiveLoan[]>('/loans', {
    params: { book_id: bookId, status: 'active' },
  });
  const data = response.data;
  if (Array.isArray(data)) return data;
  return data.data ?? [];
};

export const issueBook = async (data: {
  book_id: string | number;
  member_id: string | number;
}): Promise<ApiMessageResponse> => {
  const response = await apiClient.post<ApiMessageResponse>('/loans/issue', data);
  return response.data;
};

export const returnBook = async (id: string | number): Promise<ReturnBookResponse> => {
  const response = await apiClient.post<ReturnBookResponse>(`/loans/${id}/return`);
  return response.data;
};

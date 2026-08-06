// src/lib/api/loans.ts
import apiClient from './client';
import { Transaction, ApiMessageResponse } from './types';

export const getTransactions = async (params?: { date?: string }): Promise<Transaction[]> => {
  const response = await apiClient.get<{ data: Transaction[] } | Transaction[]>('/transactions', { params });
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.data;
};

// ✅ PERBAIKI: Scan menggunakan GET /books?isbn=xxx (sesuai catatan backend)
// ✅ Ubah scanBook menjadi:
export const scanBook = async (isbn: string): Promise<any> => {
  const response = await apiClient.get(`/books/scan/${isbn}`);
  return response.data; // langsung object Book
};

// ✅ Issue: POST /loans/issue
export const issueBook = async (data: { book_id: string | number; member_id: string | number }): Promise<ApiMessageResponse> => {
  const response = await apiClient.post<ApiMessageResponse>('/loans/issue', data);
  return response.data;
};

// ✅ Return: POST /loans/{id}/return
export const returnBook = async (id: string | number): Promise<{ message: string; fine?: number }> => {
  const response = await apiClient.post<{ message: string; fine?: number }>(`/loans/${id}/return`);
  return response.data;
};
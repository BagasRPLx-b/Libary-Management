import apiClient from './client';
import { Book, ApiResponse, ApiMessageResponse } from './types';

export const getBooks = async (params?: any): Promise<Book[]> => {
  const response = await apiClient.get<ApiResponse<Book[]> | Book[]>('/books', { params });
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.data;
};

export const getBook = async (id: string | number): Promise<Book> => {
  const response = await apiClient.get<ApiResponse<Book> | Book>(`/books/${id}`);
  if ('data' in response.data && response.data.data) {
    return response.data.data;
  }
  return response.data as Book;
};

export const createBook = async (data: any): Promise<ApiMessageResponse> => {
  const response = await apiClient.post<ApiMessageResponse>('/books', data);
  return response.data;
};

export const updateBook = async (id: string | number, data: any): Promise<ApiMessageResponse> => {
  const response = await apiClient.put<ApiMessageResponse>(`/books/${id}`, data);
  return response.data;
};

export const deleteBook = async (id: string | number): Promise<ApiMessageResponse> => {
  const response = await apiClient.delete<ApiMessageResponse>(`/books/${id}`);
  return response.data;
};

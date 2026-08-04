import apiClient from './client';
import { Member, ApiResponse, ApiMessageResponse } from './types';

export const getMembers = async (params?: any): Promise<Member[]> => {
  const response = await apiClient.get<ApiResponse<Member[]> | Member[]>('/members', { params });
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.data;
};

export const createMember = async (data: any): Promise<ApiMessageResponse> => {
  const response = await apiClient.post<ApiMessageResponse>('/members', data);
  return response.data;
};

export const updateMember = async (id: string | number, data: any): Promise<ApiMessageResponse> => {
  const response = await apiClient.put<ApiMessageResponse>(`/members/${id}`, data);
  return response.data;
};

export const deleteMember = async (id: string | number): Promise<ApiMessageResponse> => {
  const response = await apiClient.delete<ApiMessageResponse>(`/members/${id}`);
  return response.data;
};

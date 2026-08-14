import apiClient from './client';
import type { ApiMessageResponse, Member, MemberUpdateData } from '@/types';

interface MemberApiItem {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  member?: {
    id: number;
    member_code?: string;
    name?: string;
    email?: string;
    phone?: string;
    status?: string;
  };
}

function mapMemberItem(item: MemberApiItem): Member {
  return {
    id: item.id,
    member_id: item.member?.id,
    member_code: item.member?.member_code || '',
    name: item.name || item.member?.name || '',
    email: item.email || item.member?.email || '',
    phone: item.phone || item.member?.phone || '',
    status: (item.member?.status || 'active') as Member['status'],
    user_id: item.id,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

export const memberApi = {
  getAll: async (search?: string): Promise<Member[]> => {
    const response = await apiClient.get<{ data: MemberApiItem[] } | MemberApiItem[]>('/members', {
      params: search ? { search } : {},
    });
    const rawData = Array.isArray(response.data) ? response.data : response.data.data ?? [];
    return rawData.map(mapMemberItem);
  },

  getById: async (userId: number): Promise<Member> => {
    const response = await apiClient.get<{ data: MemberApiItem } | MemberApiItem>(`/members/${userId}`);
    const item = 'data' in response.data && response.data.data ? response.data.data : response.data;
    return mapMemberItem(item as MemberApiItem);
  },

  update: (id: number, data: Omit<MemberUpdateData, 'id'>) =>
    apiClient.patch<ApiMessageResponse>(`/members/${id}`, data),

  updateStatus: (id: number, status: 'active' | 'suspended') =>
    apiClient.patch<ApiMessageResponse>(`/members/${id}/status`, { status }),

  delete: (id: number) => apiClient.delete<ApiMessageResponse>(`/members/${id}`),

  getHistory: async (userId: number) => {
    const response = await apiClient.get(`/members/${userId}/history`);
    const data = response.data?.data ?? response.data ?? [];
    return Array.isArray(data) ? data : [];
  },
};

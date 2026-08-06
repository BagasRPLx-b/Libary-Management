// src/features/members/hooks/useMember.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

export interface Member {
  id: number; // User ID (users.id)
  member_id?: number; // Member ID (members.id) - untuk dikirim ke loans/issue
  member_code?: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended' | 'Active' | 'Suspended';
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

// ─── GET /members ─────────────────────────────────────────
export const useMembers = (search?: string) => {
  return useQuery({
    queryKey: ['members', search],
    queryFn: async (): Promise<Member[]> => {
      const response = await apiClient.get('/members', {
        params: search ? { search } : {},
      });

      // Response berbentuk pagination: { data: [...] }
      const rawData = response.data?.data || response.data || [];

      const members: Member[] = rawData.map((item: any) => {
        return {
          id: item.id, // User ID (3, 5, 6)
          member_id: item.member?.id, // ✅ Member ID (11, 12, 13) - untuk loans/issue
          member_code: item.member?.member_code || '',
          name: item.name || item.member?.name,
          email: item.email || item.member?.email,
          phone: item.phone || item.member?.phone || '',
          status: item.member?.status || 'active',
          user_id: item.id,
          created_at: item.created_at,
          updated_at: item.updated_at,
        };
      });

      console.log('📡 Members:', members);
      return members;
    },
    staleTime: 1000 * 60 * 5,
  });
};

// ─── GET /members/:userId ────────────────────────────────
export const useMember = (userId: number) => {
  return useQuery({
    queryKey: ['members', userId],
    queryFn: async (): Promise<Member> => {
      const response = await apiClient.get(`/members/${userId}`);
      const item = response.data?.data || response.data;

      return {
        id: item.id || userId,
        member_id: item.member?.id,
        member_code: item.member?.member_code || '',
        name: item.name || item.member?.name,
        email: item.email || item.member?.email,
        phone: item.phone || item.member?.phone || '',
        status: item.member?.status || 'active',
        user_id: item.id,
      };
    },
    enabled: !!userId,
  });
};

// ─── PATCH /members/{userId} ─────────────────────────────
export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; name: string; email: string; phone: string }) => {
      const response = await apiClient.patch(`/members/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

// ─── PATCH /members/{userId}/status ──────────────────────
export const useToggleMemberStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'active' | 'suspended' }) => {
      const response = await apiClient.patch(`/members/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

// ─── DELETE /members/{userId} ────────────────────────────
export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};
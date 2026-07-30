import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

export interface Member {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Suspended';
  created_at?: string;
}

interface MembersResponse {
  data: Member[];
}

interface MemberResponse {
  data: Member;
}

export const useMembers = (search?: string) => {
  return useQuery({
    queryKey: ['members', search],
    queryFn: async () => {
      const response = await apiClient.get<MembersResponse | Member[]>('/members', {
        params: search ? { search } : {},
      });
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data?.data || [];
    },
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newMember: { name: string; email: string; phone: string }) => {
      const { data } = await apiClient.post<MemberResponse>('/members', newMember);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Member> & { id: number }) => {
      const { data } = await apiClient.put<MemberResponse>(`/members/${id}`, updateData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

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
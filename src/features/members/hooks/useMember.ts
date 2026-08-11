import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberApi } from '@/lib/api/members';
import type { Member, MemberUpdateData } from '@/types';

export const useMembers = (search?: string) => {
  return useQuery({
    queryKey: ['members', search],
    queryFn: () => memberApi.getAll(search),
    staleTime: 1000 * 60 * 5,
  });
};

export const useMember = (userId: number) => {
  return useQuery({
    queryKey: ['members', userId],
    queryFn: () => memberApi.getById(userId),
    enabled: !!userId,
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: MemberUpdateData) => {
      const response = await memberApi.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

export const useToggleMemberStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'active' | 'suspended' }) => {
      const response = await memberApi.updateStatus(id, status);
      return response.data;
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
      await memberApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

export type { Member };

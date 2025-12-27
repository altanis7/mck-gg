'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMember } from '../api/membersApi';
import { CreateMemberDto } from '../api/types';

export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMemberDto) => {
      const result = await createMember(data);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || '멤버 생성 실패');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

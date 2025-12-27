'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMember } from '../api/membersApi';
import { UpdateMemberDto } from '../api/types';

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMemberDto }) => {
      const result = await updateMember(id, data);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || '멤버 수정 실패');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

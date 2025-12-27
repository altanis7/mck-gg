'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMember } from '../api/membersApi';

export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteMember(id);
      if (result.success) {
        return;
      }
      throw new Error(result.error || '멤버 삭제 실패');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login } from '../api/adminAuthApi';

export function useAdminLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (password: string) => {
      const result = await login(password);
      if (result.success) {
        return result;
      }
      throw new Error(result.message || '로그인에 실패했습니다.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-auth'] });
      router.push('/admin/members');
    },
  });
}

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../api/adminAuthApi';

export function useAdminLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-auth'] });
      window.location.href = '/';
    },
  });
}

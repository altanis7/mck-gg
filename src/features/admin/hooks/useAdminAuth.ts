'use client';

import { useQuery } from '@tanstack/react-query';
import { verifyAuth } from '../api/adminAuthApi';

export function useAdminAuth() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-auth'],
    queryFn: async () => {
      const result = await verifyAuth();
      return result.authenticated;
    },
    retry: false,
  });

  return {
    isAuthenticated: data ?? false,
    isLoading,
    refetch,
  };
}

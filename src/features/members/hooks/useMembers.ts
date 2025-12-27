'use client';

import { useQuery } from '@tanstack/react-query';
import { getMembers } from '../api/membersApi';

export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const result = await getMembers();
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || '멤버 목록을 불러올 수 없습니다');
    },
  });
}

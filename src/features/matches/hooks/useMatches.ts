import { useQuery } from '@tanstack/react-query';
import { getMatches } from '../api/matchesApi';

export function useMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const result = await getMatches();
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || '경기 목록을 불러올 수 없습니다');
    },
  });
}

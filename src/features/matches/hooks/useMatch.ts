import { useQuery } from '@tanstack/react-query';
import { getMatch } from '../api/matchesApi';

export function useMatch(id: string) {
  return useQuery({
    queryKey: ['matches', id],
    queryFn: async () => {
      const result = await getMatch(id);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || '경기를 불러올 수 없습니다');
    },
    enabled: !!id,
  });
}

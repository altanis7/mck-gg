import { useQuery } from '@tanstack/react-query';
import { getMatchSeriesDetail } from '../api/matchSeriesApi';

export function useMatchSeriesDetail(id: string) {
  return useQuery({
    queryKey: ['match-series', id],
    queryFn: async () => {
      const result = await getMatchSeriesDetail(id);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || '시리즈 상세 조회 실패');
    },
    enabled: !!id,
  });
}

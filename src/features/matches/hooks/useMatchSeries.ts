import { useQuery } from '@tanstack/react-query';
import { getMatchSeries } from '../api/matchSeriesApi';

export function useMatchSeries() {
  return useQuery({
    queryKey: ['match-series'],
    queryFn: async () => {
      const result = await getMatchSeries();
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || '시리즈 목록 조회 실패');
    },
  });
}

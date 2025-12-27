import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createMatchSeries } from '../api/matchSeriesApi';
import { CreateMatchSeriesDto } from '../api/types';

export function useCreateMatchSeries() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (seriesData: CreateMatchSeriesDto) => {
      const result = await createMatchSeries(seriesData);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || '시리즈 생성 실패');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['match-series'] });
      router.push(`/admin/matches/${data.id}`);
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMatchSeries } from '../api/matchSeriesApi';
import { useRouter } from 'next/navigation';

export function useDeleteSeries() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (seriesId: string) => {
      const result = await deleteMatchSeries(seriesId);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error || '시리즈 삭제 실패');
    },
    onSuccess: () => {
      // 시리즈 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['match-series-list'] });
      // 목록 페이지로 이동
      router.push('/admin/matches');
    },
  });
}

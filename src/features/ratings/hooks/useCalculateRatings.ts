/**
 * ELO 계산 Mutation Hook (관리자 전용)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { calculateRatings } from '../api/ratingsApi';

export function useCalculateRatings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: string) => calculateRatings(gameId),
    onSuccess: () => {
      // ELO 계산 성공 시 랭킹 캐시 무효화 (새로고침)
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
      queryClient.invalidateQueries({ queryKey: ['memberRatings'] });
    },
  });
}

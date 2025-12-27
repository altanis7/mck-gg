import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGameResult } from '../api/gameResultsApi';
import { CreateGameResultDto } from '../api/types';

export function useCreateGameResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      data,
    }: {
      matchId: string;
      data: CreateGameResultDto;
    }) => {
      const result = await createGameResult(matchId, data);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || '경기 결과 등록에 실패했습니다');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-results'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

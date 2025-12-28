import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteGame } from '../api/gamesApi';

export function useDeleteGame(seriesId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: string) => {
      const result = await deleteGame(gameId);
      if (!result.success) {
        throw new Error(result.error || '게임 삭제 실패');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-series', seriesId] });
    },
  });
}

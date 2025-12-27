import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMatch } from '../api/matchesApi';
import { CreateMatchDto } from '../api/types';

export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchData: CreateMatchDto) => {
      const result = await createMatch(matchData);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || '경기 등록에 실패했습니다');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

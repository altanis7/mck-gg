import { useQuery } from '@tanstack/react-query';
import { getMemberStats } from '../api/membersApi';

/**
 * 멤버 통계 데이터를 가져오는 훅
 */
export function useMemberStats(memberId: string) {
  return useQuery({
    queryKey: ['member-stats', memberId],
    queryFn: async () => {
      const response = await getMemberStats(memberId);
      if (!response.success || !response.data) {
        throw new Error(response.error || '멤버 통계를 가져오는데 실패했습니다');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5분
    enabled: !!memberId,
  });
}

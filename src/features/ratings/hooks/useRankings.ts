/**
 * 전체 랭킹 조회 Hook (티어 자동 계산 포함)
 */

import { useQuery } from '@tanstack/react-query';
import { getRankings } from '../api/ratingsApi';
import { getTierByPercentile } from '../utils/tierSystem';
import { MemberRankingWithTier } from '../api/types';

export function useRankings() {
  return useQuery({
    queryKey: ['rankings'],
    queryFn: async (): Promise<MemberRankingWithTier[]> => {
      const { rankings, totalPlayers } = await getRankings();

      // 각 멤버에게 순위 백분율 기반 티어 배정
      return rankings.map((member) => {
        const tierConfig = getTierByPercentile(member.ranking, totalPlayers);

        return {
          ...member,
          tier: tierConfig.name,
          tierConfig,
          topChampions: member.topChampions || [],
          lastGameDate: member.lastGameDate,
          avgKda: member.avgKda,
          avgKills: member.avgKills,
          avgDeaths: member.avgDeaths,
          avgAssists: member.avgAssists,
          rankingChange: member.rankingChange,
        };
      });
    },
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
}

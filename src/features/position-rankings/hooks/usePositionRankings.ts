/**
 * 포지션별 랭킹 데이터 조회 훅
 */

import { useMemo } from 'react';
import { useMatchSeries } from '@/features/matches/hooks/useMatchSeries';
import { useMembers } from '@/features/members/hooks/useMembers';
import { calculatePositionRankings } from '../utils/positionStatsCalculator';
import { PositionRankingsMap } from '../api/types';

export function usePositionRankings() {
  const {
    data: series,
    isLoading: seriesLoading,
    error: seriesError,
  } = useMatchSeries();
  const {
    data: members,
    isLoading: membersLoading,
    error: membersError,
  } = useMembers();

  // 로딩 및 에러 상태
  const isLoading = seriesLoading || membersLoading;
  const error = seriesError || membersError;

  // 포지션별 랭킹 계산 (메모이제이션)
  const data: PositionRankingsMap | undefined = useMemo(() => {
    if (!series || !members) return undefined;
    return calculatePositionRankings(series, members);
  }, [series, members]);

  return {
    data,
    isLoading,
    error,
  };
}

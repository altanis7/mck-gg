'use client';

import { useMemberStats } from '../hooks/useMemberStats';
import { Loading } from '@/shared/components/ui/Loading';
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage';
import { PlayerStatsPageSkeleton } from './PlayerStatsPageSkeleton';
import { PlayerProfileCard } from './PlayerProfileCard';
import { EloHistoryGraph } from './EloHistoryGraph';
import { MostPlayedChampions } from './MostPlayedChampions';
import { PositionStatsCard } from './PositionStatsCard';
import { RecentMatchesList } from './RecentMatchesList';

interface PlayerStatsPageProps {
  memberId: string;
}

export function PlayerStatsPage({ memberId }: PlayerStatsPageProps) {
  const { data, isLoading, error } = useMemberStats(memberId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PlayerStatsPageSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          message={
            error?.message || '멤버 통계를 불러오는데 실패했습니다'
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽 컬럼 */}
        <div className="space-y-6 lg:col-span-1">
          <PlayerProfileCard member={data.member} stats={data.stats} tierConfig={data.tierConfig} />
          <EloHistoryGraph eloHistory={data.eloHistory} />
          <MostPlayedChampions champions={data.topChampions} />
          <PositionStatsCard positions={data.positionStats} />
        </div>

        {/* 오른쪽 컬럼 */}
        <div className="lg:col-span-2">
          <RecentMatchesList matches={data.recentMatches} playerId={memberId} />
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRankings } from "@/features/ratings/hooks/useRankings";
import { MemberRankingWithTier } from "@/features/ratings/api/types";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/shared/components/ui/Card";
import { TierBadge } from "@/features/ratings/components/TierBadge";
import { ChampionAvatar } from "@/shared/components/ui/ChampionAvatar";
import { cn } from "@/lib/utils";

// KDA 점수별 색상 반환
const getKdaColor = (kda: number): string => {
  if (kda >= 5.0) return "#ff8200"; // 오렌지
  if (kda >= 4.0) return "#0093ff"; // 파란색
  if (kda >= 3.0) return "#00bba3"; // 청록색
  return "#758592"; // 회색
};

// 승률별 색상 반환
const getWinRateColor = (winRate: number): string => {
  if (winRate >= 60) return "#d31a45"; // 빨간색
  return "#758592"; // 회색
};

// 순위별 색상 반환
const getRankColor = (rank: number): string => {
  if (rank === 1) return "text-yellow-400"; // 골드
  if (rank === 2) return "text-gray-300"; // 실버
  if (rank === 3) return "text-amber-600"; // 브론즈
  return "text-white";
};

// 순위 라벨 반환
const getRankLabel = (rank: number): string => {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return `${rank}th`;
};

// TOP 3 카드 컴포넌트
function TopThreeCard({
  member,
  rank,
  isWinner = false,
  className,
}: {
  member: MemberRankingWithTier;
  rank: number;
  isWinner?: boolean;
  className?: string;
}) {
  return (
    <Link href={`/members/${member.id}`} className={className}>
      <Card
        className={cn(
          "hover:scale-105 transition-all duration-300 cursor-pointer",
          isWinner && "md:scale-110 ring-2 ring-yellow-400/50"
        )}
      >
        <CardHeader className="text-center space-y-3">
          {/* 순위 뱃지 */}
          <div className={cn("text-5xl font-bold", getRankColor(rank))}>
            {getRankLabel(rank)}
          </div>

          {/* 멤버 정보 */}
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">{member.name}</h3>
            <p className="text-sm text-gray-400">{member.summoner_name}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 티어 + LP */}
          <div className="flex items-center justify-center gap-3">
            <TierBadge
              tierConfig={member.tierConfig}
              size="lg"
              showName={false}
            />
            <span className="text-xl font-bold text-white">
              {member.current_elo} LP
            </span>
          </div>

          {/* 승률 */}
          <div className="text-center">
            <div
              className="text-2xl font-bold mb-1"
              style={{ color: getWinRateColor(member.win_rate) }}
            >
              {member.win_rate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">
              {member.total_series_wins}승 {member.total_series - member.total_series_wins}패
            </div>
          </div>

          {/* KDA */}
          {member.avgKda !== undefined && (
            <div className="text-center">
              <div
                className="text-lg font-semibold mb-1"
                style={{ color: getKdaColor(member.avgKda) }}
              >
                {member.avgKda.toFixed(2)}:1 KDA
              </div>
              <div className="text-xs text-gray-400">
                {member.avgKills?.toFixed(1)} / {member.avgDeaths?.toFixed(1)} /{" "}
                {member.avgAssists?.toFixed(1)}
              </div>
            </div>
          )}

          {/* 모스트 챔피언 */}
          {member.topChampions.length > 0 && (
            <div className="flex justify-center gap-2 pt-2">
              {member.topChampions.slice(0, 3).map((champ, idx) => (
                <ChampionAvatar
                  key={idx}
                  championName={champ.championName}
                  size="lg"
                  shape="circle"
                  showTooltip={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// 로딩 스켈레톤
function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="h-32 bg-slate-700/50 rounded-t-lg" />
          <CardContent className="h-48 bg-slate-700/30" />
        </Card>
      ))}
    </div>
  );
}

// 에러 상태
function ErrorState() {
  return (
    <div className="text-center py-12">
      <p className="text-gray-400">랭킹 데이터를 불러올 수 없습니다.</p>
    </div>
  );
}

// 빈 데이터 상태
function EmptyState() {
  return (
    <div className="text-center py-12">
      <p className="text-gray-400 mb-4">아직 랭킹 데이터가 없습니다</p>
      <p className="text-sm text-gray-500">첫 경기를 등록해보세요!</p>
    </div>
  );
}

export default function Home() {
  const { data: rankings, isLoading, error } = useRankings();
  const topThree = rankings?.slice(0, 3) || [];

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center space-y-12 md:space-y-16 py-8">
      {/* 히어로 섹션 - 큰 로고 */}
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold font-partial-sans">
          <span className="text-white">MCK</span>
          <span className="text-blue-400">.GG</span>
        </h1>
      </div>

      {/* TOP 3 랭킹 카드 */}
      <div className="w-full max-w-6xl px-4">
        {isLoading && <LoadingState />}
        {error && <ErrorState />}
        {!isLoading && !error && topThree.length === 0 && <EmptyState />}
        {!isLoading && !error && topThree.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1st - 모바일: 1번째, 데스크톱: 2번째(중앙) */}
              {topThree[0] && (
                <TopThreeCard
                  member={topThree[0]}
                  rank={1}
                  isWinner
                  className="order-1 md:order-2"
                />
              )}

              {/* 2nd - 모바일: 2번째, 데스크톱: 1번째(왼쪽) */}
              {topThree[1] && (
                <TopThreeCard
                  member={topThree[1]}
                  rank={2}
                  className="order-2 md:order-1"
                />
              )}

              {/* 3rd - 모바일: 3번째, 데스크톱: 3번째(오른쪽) */}
              {topThree[2] && (
                <TopThreeCard
                  member={topThree[2]}
                  rank={3}
                  className="order-3 md:order-3"
                />
              )}
            </div>

            {/* 전체 랭킹 보기 링크 */}
            <div className="mt-8 text-center">
              <Link
                href="/ratings"
                className="text-blue-400 hover:text-blue-300 transition-colors text-lg"
              >
                전체 랭킹 보기 →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

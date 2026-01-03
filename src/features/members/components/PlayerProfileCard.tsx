import { Member } from "../api/types";
import { PlayerOverallStats } from "../api/types";
import { TierBadge } from "@/features/ratings/components/TierBadge";
import { SeriesStreakBadge } from "@/features/ratings/components/SeriesStreakBadge";
import { TierConfig } from "@/features/ratings/api/types";
import {
  getKdaColor,
  getWinRateColor,
  formatDamage,
} from "../utils/statsCalculations";

interface PlayerProfileCardProps {
  member: Member;
  stats: PlayerOverallStats;
  tierConfig: TierConfig;
}

export function PlayerProfileCard({ member, stats, tierConfig }: PlayerProfileCardProps) {
  const kdaColor = getKdaColor(stats.avgKda);
  const winRateColor = getWinRateColor(stats.winRate);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* 티어 배지 */}
      <div className="flex items-center gap-4 mb-6">
        <TierBadge tierConfig={tierConfig} size="xl" showName={true} />
      </div>

      {/* 플레이어 이름 */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white">{member.name}</h2>
        <p className="text-sm text-gray-400">{member.summoner_name}</p>
      </div>

      {/* ELO 정보 */}
      <div className="mb-4 pb-4 border-b border-slate-700">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            {stats.currentElo.toLocaleString()} LP
          </span>
        </div>
        <div className="text-sm text-gray-400 mt-1">
          최고: {stats.peakElo.toLocaleString()} LP
        </div>
      </div>

      {/* 승패 기록 */}
      <div className="mb-4 pb-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">전적</span>
          <span className="text-sm text-white">
            {stats.wins}승 {stats.losses}패
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">승률</span>
          <span className="text-lg font-bold" style={{ color: winRateColor }}>
            {stats.winRate.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* KDA 정보 */}
      <div className="mb-4 pb-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">평균 KDA</span>
          <span className="text-lg font-bold" style={{ color: kdaColor }}>
            {stats.avgKda.toFixed(2)}:1
          </span>
        </div>
        <div className="text-center py-2 bg-slate-900/50 rounded">
          <span className="text-base text-white">
            {stats.avgKills.toFixed(1)} / {stats.avgDeaths.toFixed(1)} /{" "}
            {stats.avgAssists.toFixed(1)}
          </span>
        </div>
      </div>

      {/* 평균 통계 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">평균 CS</span>
          <span className="text-white font-semibold">
            {stats.avgCs.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">평균 딜량</span>
          <span className="text-white font-semibold">
            {formatDamage(stats.avgDamage)}
          </span>
        </div>
      </div>

      {/* 시리즈 연승/연패 표시 */}
      {Math.abs(stats.currentSeriesStreak) >= 3 && (
        <div className="mt-4 pt-4 border-t border-slate-700 flex justify-center">
          <SeriesStreakBadge
            streak={stats.currentSeriesStreak}
            size="lg"
            animated={true}
          />
        </div>
      )}
    </div>
  );
}

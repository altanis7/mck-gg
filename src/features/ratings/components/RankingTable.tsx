/**
 * 랭킹 테이블 컴포넌트
 *
 * 전체 멤버의 ELO 랭킹을 표시합니다.
 */

"use client";

import { MemberRankingWithTier } from "../api/types";
import { TierBadge } from "./TierBadge";
import { ChampionAvatar } from "@/shared/components/ui/ChampionAvatar";
import { cn } from "@/lib/utils";

interface RankingTableProps {
  rankings: MemberRankingWithTier[];
}

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

export function RankingTable({ rankings }: RankingTableProps) {
  if (rankings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        아직 게임을 플레이한 멤버가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-900 text-gray-300 border-b border-gray-700">
            <th className="px-4 py-3 text-center text-xs font-semibold">
              순위
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold">
              변동
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold">
              소환사
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold">
              티어
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold">
              평점
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold">
              승률
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold">
              최근 게임
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold">
              모스트 챔피언
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800">
          {rankings.map((member) => {
            const rankChange = member.rankingChange || 0;
            const formattedDate = member.lastGameDate
              ? new Date(member.lastGameDate).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })
              : "-";

            return (
              <tr
                key={member.id}
                className={cn(
                  "border-b border-gray-700 hover:bg-gray-750 transition-colors"
                )}
              >
                {/* 순위 */}
                <td className="px-4 py-4 text-center">
                  <span className="text-lg font-bold text-white">
                    {member.ranking}
                  </span>
                </td>

                {/* 변동 */}
                <td className="px-4 py-4 text-center">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-semibold min-w-[60px]",
                      rankChange > 0
                        ? "bg-green-600 text-white"
                        : rankChange < 0
                        ? "bg-red-600 text-white"
                        : "bg-gray-600 text-gray-300"
                    )}
                  >
                    {rankChange > 0 && "↑ "}
                    {rankChange < 0 && "↓ "}
                    {rankChange !== 0 ? Math.abs(rankChange) : "- 0"}
                  </span>
                </td>

                {/* 소환사 이름 */}
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-white">
                      {member.name}({member.summoner_name})
                    </span>
                    {(member.current_streak >= 3 ||
                      member.current_streak <= -3) && (
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          member.current_streak >= 3
                            ? "text-green-500"
                            : "text-red-500"
                        )}
                      >
                        {member.current_streak >= 3
                          ? `${member.current_streak}연승`
                          : `${Math.abs(member.current_streak)}연패`}
                      </span>
                    )}
                  </div>
                </td>

                {/* 티어 + ELO */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <TierBadge
                      tierConfig={member.tierConfig}
                      size="lg"
                      showName={false}
                    />
                    <span className="text-base font-bold text-white">
                      {member.current_elo} LP
                    </span>
                  </div>
                </td>

                {/* 평점 (KDA) */}
                <td className="px-4 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    {member.avgKda !== undefined ? (
                      <>
                        <span
                          className="text-base font-semibold"
                          style={{ color: getKdaColor(member.avgKda) }}
                        >
                          {member.avgKda.toFixed(2)}:1
                        </span>
                        <span className="text-xs text-gray-400">
                          {member.avgKills?.toFixed(1) || '0.0'} / {member.avgDeaths?.toFixed(1) || '0.0'} / {member.avgAssists?.toFixed(1) || '0.0'}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </div>
                </td>

                {/* 승률 */}
                <td className="px-4 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className="text-base font-semibold"
                      style={{ color: getWinRateColor(member.win_rate) }}
                    >
                      {member.win_rate.toFixed(2)}%
                    </span>
                    <span className="text-xs text-gray-400">
                      {member.total_wins}승 {member.total_games - member.total_wins}패
                    </span>
                  </div>
                </td>

                {/* 최근 게임 */}
                <td className="px-4 py-4 text-center">
                  <span className="text-sm text-gray-300">
                    {formattedDate}
                  </span>
                </td>

                {/* 모스트 챔피언 3개 */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {member.topChampions.length > 0 ? (
                      member.topChampions.map((champ, idx) => (
                        <ChampionAvatar
                          key={idx}
                          championName={champ.championName}
                          size="md"
                          shape="circle"
                          showTooltip={true}
                        />
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

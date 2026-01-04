/**
 * 포지션별 랭킹 테이블 컴포넌트
 */

"use client";

import Link from "next/link";
import { PositionRanking, RankingType } from "../api/types";
import { getKdaColor } from "@/features/members/utils/statsCalculations";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface PositionRankingTableProps {
  rankings: PositionRanking[];
  rankingType: RankingType;
}

// 순위별 색상 반환
const getRankColor = (rank: number): string => {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-gray-300";
  if (rank === 3) return "text-amber-600";
  return "text-white";
};

export function PositionRankingTable({
  rankings,
  rankingType,
}: PositionRankingTableProps) {
  // 최대 딜량 계산 (막대그래프용)
  const maxDamage = useMemo(() => {
    if (rankings.length === 0) return 1;
    return Math.max(...rankings.map(r => r.avgDamage));
  }, [rankings]);

  if (rankings.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-gray-400">
          해당 포지션에서 3경기 이상 플레이한 선수가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-lg shadow-sm border border-slate-700 backdrop-blur-sm overflow-hidden">
      {/* 데스크톱 테이블 */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50 border-b border-slate-700">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">
                순위
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                플레이어
              </th>

              {/* 승률 탭 전용 컬럼 */}
              {rankingType === 'winRate' && (
                <>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">
                    경기 수
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">
                    승률
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">
                    KDA
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">
                    평균 K/D/A
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">
                    평균 CS
                  </th>
                </>
              )}

              {/* 딜량 탭 전용 컬럼 */}
              {rankingType === 'damage' && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                  평균 딜량
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {rankings.map((ranking, index) => (
              <tr key={ranking.memberId} className="hover:bg-slate-700/50">
                {/* 순위 */}
                <td className="px-4 py-3 text-center">
                  <span className={cn("font-bold text-lg", getRankColor(index + 1))}>
                    {index + 1}
                  </span>
                </td>

                {/* 플레이어 */}
                <td className="px-4 py-3">
                  <Link
                    href={`/members/${ranking.memberId}`}
                    className="hover:text-blue-400 transition-colors"
                  >
                    <div className="font-semibold text-white">
                      {ranking.memberName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {ranking.summonerName}
                    </div>
                  </Link>
                </td>

                {/* 승률 탭 전용 컬럼 */}
                {rankingType === 'winRate' && (
                  <>
                    {/* 경기 수 */}
                    <td className="px-4 py-3 text-center text-white">
                      {ranking.gamesPlayed}
                    </td>

                    {/* 승률 */}
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-white text-lg">
                        {ranking.winRate.toFixed(1)}%
                      </span>
                      <div className="text-xs text-gray-500">
                        {ranking.wins}승 {ranking.losses}패
                      </div>
                    </td>

                    {/* KDA */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className="font-semibold text-base"
                        style={{ color: getKdaColor(ranking.avgKda) }}
                      >
                        {ranking.avgKda.toFixed(2)}
                      </span>
                    </td>

                    {/* 평균 K/D/A */}
                    <td className="px-4 py-3 text-center text-sm text-gray-200">
                      {ranking.avgKills.toFixed(1)} / {ranking.avgDeaths.toFixed(1)} /{" "}
                      {ranking.avgAssists.toFixed(1)}
                    </td>

                    {/* 평균 CS */}
                    <td className="px-4 py-3 text-center text-white">
                      {ranking.avgCS.toFixed(1)}
                    </td>
                  </>
                )}

                {/* 딜량 탭: 막대그래프만 */}
                {rankingType === 'damage' && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* 막대그래프 */}
                      <div className="flex-1 bg-slate-900 rounded h-8 overflow-hidden">
                        <div
                          className={cn(
                            index === 0 ? "bg-yellow-500" : "bg-slate-600",
                            "h-full flex items-center justify-end px-3 transition-all"
                          )}
                          style={{ width: `${(ranking.avgDamage / maxDamage) * 100}%` }}
                        >
                          <span className="text-sm font-bold text-white whitespace-nowrap">
                            {ranking.avgDamage.toLocaleString('ko-KR', {
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드 */}
      <div className="md:hidden divide-y divide-slate-700">
        {rankings.map((ranking, index) => (
          <Link
            key={ranking.memberId}
            href={`/members/${ranking.memberId}`}
            className="block p-4 hover:bg-slate-700/50 transition-colors"
          >
            {/* 상단: 순위 + 플레이어 + 주요 지표 */}
            <div className="flex items-start gap-3 mb-3">
              <span
                className={cn("font-bold text-lg flex-shrink-0", getRankColor(index + 1))}
              >
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white">{ranking.memberName}</div>
                <div className="text-xs text-gray-500">{ranking.summonerName}</div>
              </div>
              <div className="text-right flex-shrink-0">
                {rankingType === "winRate" && (
                  <>
                    <div className="text-lg font-bold text-white">
                      {ranking.winRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {ranking.wins}승 {ranking.losses}패
                    </div>
                  </>
                )}
                {rankingType === "damage" && (
                  <>
                    <div className="text-lg font-bold text-white">
                      {(ranking.avgDamage / 1000).toFixed(1)}k
                    </div>
                    <div className="text-xs text-gray-500">딜량</div>
                  </>
                )}
              </div>
            </div>

            {/* 하단: 세부 통계 */}
            {rankingType === "winRate" && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-gray-500">경기</div>
                  <div className="font-semibold text-white">
                    {ranking.gamesPlayed}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">KDA</div>
                  <div
                    className="font-semibold"
                    style={{ color: getKdaColor(ranking.avgKda) }}
                  >
                    {ranking.avgKda.toFixed(2)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">CS</div>
                  <div className="font-semibold text-white">
                    {ranking.avgCS.toFixed(1)}
                  </div>
                </div>
              </div>
            )}

            {rankingType === "damage" && (
              /* 막대그래프만 */
              <div className="bg-slate-900 rounded h-8 overflow-hidden">
                <div
                  className={cn(
                    index === 0 ? "bg-yellow-500" : "bg-slate-600",
                    "h-full flex items-center justify-end px-3 transition-all"
                  )}
                  style={{ width: `${(ranking.avgDamage / maxDamage) * 100}%` }}
                >
                  <span className="text-sm font-bold text-white whitespace-nowrap">
                    {ranking.avgDamage.toLocaleString('ko-KR', {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

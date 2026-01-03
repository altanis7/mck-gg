"use client";

import { useState } from "react";
import { useMatchSeries } from "@/features/matches/hooks/useMatchSeries";
import { useMembers } from "@/features/members/hooks/useMembers";
import { Loading } from "@/shared/components/ui/Loading";
import { ErrorMessage } from "@/shared/components/ui/ErrorMessage";
import { ChampionAvatar } from "@/shared/components/ui/ChampionAvatar";

interface PlayerStats {
  memberId: string;
  memberName: string;
  summonerName: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  totalDamage: number;
  avgDamage: number;
  totalCS: number;
  avgCS: number;
  topChampions: { name: string; games: number }[];
}

type SortKey = "winRate" | "kda" | "avgKills" | "avgDamage" | "gamesPlayed";

export default function StatsPage() {
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
  const [sortBy, setSortBy] = useState<SortKey>("winRate");

  if (seriesLoading || membersLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  if (seriesError || membersError || !series || !members) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="통계를 불러올 수 없습니다" />
      </div>
    );
  }

  // 플레이어별 통계 계산
  const playerStatsMap = new Map<string, PlayerStats>();

  // 완료된 시리즈의 모든 게임 결과 집계
  series.forEach((serie: any) => {
    if (serie.series_status !== "completed") return;

    serie.games?.forEach((game: any) => {
      if (!game.game_results) return;

      game.game_results.forEach((result: any) => {
        if (!result.member_id) return;

        const memberId = result.member_id;
        const isWin = result.team === game.winning_team;

        if (!playerStatsMap.has(memberId)) {
          const member = members.find((m) => m.id === memberId);
          playerStatsMap.set(memberId, {
            memberId,
            memberName: member?.name || "-",
            summonerName: member?.summoner_name || "",
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            kills: 0,
            deaths: 0,
            assists: 0,
            kda: 0,
            avgKills: 0,
            avgDeaths: 0,
            avgAssists: 0,
            totalDamage: 0,
            avgDamage: 0,
            totalCS: 0,
            avgCS: 0,
            topChampions: [],
          });
        }

        const stats = playerStatsMap.get(memberId)!;
        stats.gamesPlayed++;
        if (isWin) stats.wins++;
        else stats.losses++;
        stats.kills += result.kills;
        stats.deaths += result.deaths;
        stats.assists += result.assists;
        stats.totalDamage += result.champion_damage;
        stats.totalCS += result.cs;
      });
    });
  });

  // 평균 계산 및 KDA 계산
  const playerStats = Array.from(playerStatsMap.values()).map((stats) => {
    stats.winRate =
      stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed) * 100 : 0;
    stats.avgKills =
      stats.gamesPlayed > 0 ? stats.kills / stats.gamesPlayed : 0;
    stats.avgDeaths =
      stats.gamesPlayed > 0 ? stats.deaths / stats.gamesPlayed : 0;
    stats.avgAssists =
      stats.gamesPlayed > 0 ? stats.assists / stats.gamesPlayed : 0;
    stats.kda =
      stats.deaths > 0
        ? (stats.kills + stats.assists) / stats.deaths
        : stats.kills + stats.assists;
    stats.avgDamage =
      stats.gamesPlayed > 0 ? stats.totalDamage / stats.gamesPlayed : 0;
    stats.avgCS = stats.gamesPlayed > 0 ? stats.totalCS / stats.gamesPlayed : 0;
    return stats;
  });

  // 정렬
  const sortedStats = [...playerStats].sort((a, b) => {
    const valueA = a[sortBy];
    const valueB = b[sortBy];
    return valueB - valueA;
  });

  // 최소 게임 수 필터 (3경기 이상)
  const filteredStats = sortedStats.filter((stat) => stat.gamesPlayed >= 3);

  // 용병 제외 필터
  const nonGuestStats = filteredStats.filter((stat) => {
    const member = members.find((m) => m.id === stat.memberId);
    return member && !member.is_guest;
  });

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "winRate", label: "승률" },
    { key: "kda", label: "KDA" },
    { key: "avgKills", label: "평균 킬" },
    { key: "avgDamage", label: "평균 피해량" },
    { key: "gamesPlayed", label: "게임 수" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">플레이어 랭킹</h1>
        <p className="text-gray-300">
          최소 3경기 이상 플레이한 선수만 표시됩니다
        </p>
      </div>

      {/* 정렬 옵션 */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {sortOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => setSortBy(option.key)}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              sortBy === option.key
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {nonGuestStats.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            통계를 표시할 수 있는 데이터가 부족합니다
          </p>
        </div>
      ) : (
        <div className="bg-slate-800/50 rounded-lg shadow-sm border border-slate-700 backdrop-blur-sm overflow-hidden">
          {/* 데스크톱 테이블 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                    순위
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                    플레이어
                  </th>
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
                    평균 피해량
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">
                    평균 CS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {nonGuestStats.map((stat, index) => (
                  <tr key={stat.memberId} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`font-bold ${
                          index === 0
                            ? "text-yellow-600 text-lg"
                            : index === 1
                            ? "text-gray-400 text-lg"
                            : index === 2
                            ? "text-orange-600 text-lg"
                            : "text-gray-300"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold text-white">
                          {stat.memberName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {stat.summonerName}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-white">
                      {stat.gamesPlayed}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-white">
                        {stat.winRate.toFixed(1)}%
                      </span>
                      <div className="text-xs text-gray-500">
                        {stat.wins}승 {stat.losses}패
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-white">
                        {stat.kda.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-200">
                      {stat.avgKills.toFixed(1)} / {stat.avgDeaths.toFixed(1)} /{" "}
                      {stat.avgAssists.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-white">
                      {stat.avgDamage.toLocaleString("ko-KR", {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-white">
                      {stat.avgCS.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 */}
          <div className="md:hidden divide-y divide-slate-700">
            {nonGuestStats.map((stat, index) => (
              <div key={stat.memberId} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className={`font-bold text-lg ${
                      index === 0
                        ? "text-yellow-600"
                        : index === 1
                        ? "text-gray-400"
                        : index === 2
                        ? "text-orange-600"
                        : "text-gray-300"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold text-white">
                      {stat.memberName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stat.summonerName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">
                      {stat.winRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {stat.wins}승 {stat.losses}패
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-gray-500">KDA</div>
                    <div className="font-bold text-white">
                      {stat.kda.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500">평균 K/D/A</div>
                    <div className="font-semibold text-white">
                      {stat.avgKills.toFixed(1)}/{stat.avgDeaths.toFixed(1)}/
                      {stat.avgAssists.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500">피해량</div>
                    <div className="font-semibold text-white">
                      {(stat.avgDamage / 1000).toFixed(1)}k
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

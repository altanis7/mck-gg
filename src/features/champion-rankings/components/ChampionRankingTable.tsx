/**
 * 챔피언 랭킹 테이블 컴포넌트
 */

"use client";

import Image from "next/image";
import {
  ChampionStatsTab,
  ChampionWinRateStats,
  ChampionBanStats,
} from "../api/types";

interface ChampionRankingTableProps {
  tab: ChampionStatsTab;
  winRateStats: ChampionWinRateStats[];
  banRateStats: ChampionBanStats[];
}

function ChampionImage({ championName }: { championName: string }) {
  return (
    <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
      <Image
        src={`/champ/${championName}.webp`}
        alt={championName}
        fill
        className="object-cover"
        sizes="40px"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}

function WinRateTable({ stats }: { stats: ChampionWinRateStats[] }) {
  if (stats.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        챔피언 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[400px]">
        <thead>
          <tr className="border-b border-slate-700 text-gray-400 text-xs sm:text-sm">
            <th className="text-center py-3 px-2 sm:px-4 font-medium w-10 sm:w-12">
              #
            </th>
            <th className="text-left py-3 px-2 sm:px-4 font-medium">챔피언</th>
            <th className="text-center py-3 px-2 sm:px-4 font-medium w-12 sm:w-16">
              픽
            </th>
            <th className="text-center py-3 px-2 sm:px-4 font-medium w-12 sm:w-16">
              승
            </th>
            <th className="text-center py-3 px-2 sm:px-4 font-medium w-12 sm:w-16">
              패
            </th>
            <th className="text-center py-3 px-2 sm:px-4 font-medium w-16 sm:w-20">
              승률
            </th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat, index) => (
            <tr
              key={stat.championName}
              className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
            >
              <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-gray-400 font-medium text-sm">
                {index + 1}
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <ChampionImage championName={stat.championName} />
                  <span className="font-medium text-white text-sm sm:text-base truncate max-w-[100px] sm:max-w-none">
                    {stat.championName}
                  </span>
                </div>
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-gray-300 text-sm">
                {stat.picks}
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-blue-400 text-sm font-medium">
                {stat.wins}
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-red-400 text-sm font-medium">
                {stat.losses}
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                <span
                  className={`text-sm sm:text-base font-semibold ${
                    stat.winRate >= 55
                      ? "text-green-400"
                      : stat.winRate >= 50
                      ? "text-blue-400"
                      : stat.winRate >= 45
                      ? "text-gray-300"
                      : "text-red-400"
                  }`}
                >
                  {stat.winRate.toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BanRateTable({ stats }: { stats: ChampionBanStats[] }) {
  if (stats.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        밴 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[400px]">
        <thead>
          <tr className="border-b border-slate-700 text-gray-400 text-xs sm:text-sm">
            <th className="text-center py-3 px-2 sm:px-4 font-medium w-10 sm:w-12">
              #
            </th>
            <th className="text-left py-3 px-2 sm:px-4 font-medium">챔피언</th>
            <th className="text-center py-3 px-2 sm:px-4 font-medium w-12 sm:w-16">
              밴
            </th>
            <th className="text-center py-3 px-2 sm:px-4 font-medium w-16 sm:w-20 hidden sm:table-cell">
              총 게임
            </th>
            <th className="text-center py-3 px-2 sm:px-4 font-medium w-16 sm:w-20">
              밴률
            </th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat, index) => (
            <tr
              key={stat.championName}
              className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
            >
              <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-gray-400 font-medium text-sm">
                {index + 1}
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <ChampionImage championName={stat.championName} />
                  <span className="font-medium text-white text-sm sm:text-base truncate max-w-[100px] sm:max-w-none">
                    {stat.championName}
                  </span>
                </div>
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-red-400 text-sm font-medium">
                {stat.bans}
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-gray-300 text-sm hidden sm:table-cell">
                {stat.totalGames}
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                <span
                  className={`text-sm sm:text-base font-semibold ${
                    stat.banRate >= 50
                      ? "text-red-400"
                      : stat.banRate >= 30
                      ? "text-orange-400"
                      : stat.banRate >= 15
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  {stat.banRate.toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChampionRankingTable({
  tab,
  winRateStats,
  banRateStats,
}: ChampionRankingTableProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-md backdrop-blur-sm overflow-hidden">
      {tab === "winRate" ? (
        <WinRateTable stats={winRateStats} />
      ) : (
        <BanRateTable stats={banRateStats} />
      )}
    </div>
  );
}

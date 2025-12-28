/**
 * 랭킹 페이지
 *
 * 전체 멤버의 ELO 랭킹을 표시합니다.
 */

"use client";

import { useRankings } from "@/features/ratings/hooks/useRankings";
import { RankingTable } from "@/features/ratings/components/RankingTable";

export default function RatingsPage() {
  const { data: rankings, isLoading, error } = useRankings();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">랭킹</h1>
        <p className="text-white">
          내전 참가자들의 실력 순위입니다. 게임 결과에 따라 실시간으로
          업데이트됩니다.
        </p>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-white">랭킹 불러오는 중...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          랭킹을 불러오는데 실패했습니다. 다시 시도해주세요.
        </div>
      )}

      {rankings && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-md backdrop-blur-sm overflow-hidden">
          <RankingTable rankings={rankings} />
        </div>
      )}
    </div>
  );
}

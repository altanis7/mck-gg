/**
 * 챔피언 랭킹 메인 페이지 컴포넌트
 */

"use client";

import { useState } from "react";
import { ChampionStatsTab } from "../api/types";
import { useChampionStats } from "../hooks/useChampionStats";
import { ChampionStatsTabs } from "./ChampionStatsTabs";
import { ChampionRankingTable } from "./ChampionRankingTable";
import { Loading } from "@/shared/components/ui/Loading";
import { ErrorMessage } from "@/shared/components/ui/ErrorMessage";

export function ChampionRankingsPage() {
  const [selectedTab, setSelectedTab] = useState<ChampionStatsTab>("winRate");
  const { data, isLoading, error } = useChampionStats();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="챔피언 통계를 불러올 수 없습니다" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">챔피언 랭킹</h1>
        <p className="text-gray-300">
          {selectedTab === "winRate"
            ? "챔피언별 승률 순위입니다"
            : "챔피언별 밴률 순위입니다"}
        </p>
      </div>

      <ChampionStatsTabs selected={selectedTab} onSelect={setSelectedTab} />

      <ChampionRankingTable
        tab={selectedTab}
        winRateStats={data?.winRateStats || []}
        banRateStats={data?.banRateStats || []}
      />
    </div>
  );
}


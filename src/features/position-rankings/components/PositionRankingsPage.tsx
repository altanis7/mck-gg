/**
 * 포지션별 랭킹 메인 페이지 컴포넌트
 */

"use client";

import { useState, useMemo } from "react";
import { Position, RankingType } from "../api/types";
import { usePositionRankings } from "../hooks/usePositionRankings";
import { sortByRankingType } from "../utils/positionStatsCalculator";
import { PositionTabs } from "./PositionTabs";
import { RankingTypeTabs } from "./RankingTypeTabs";
import { PositionRankingTable } from "./PositionRankingTable";
import { Loading } from "@/shared/components/ui/Loading";
import { ErrorMessage } from "@/shared/components/ui/ErrorMessage";

export function PositionRankingsPage() {
  const [selectedPosition, setSelectedPosition] = useState<Position>("top");
  const [selectedRankingType, setSelectedRankingType] = useState<RankingType>("winRate");

  const { data: allPositionRankings, isLoading, error } = usePositionRankings();

  // 선택된 포지션 + 랭킹 타입에 따라 정렬된 데이터
  const currentRankings = useMemo(() => {
    if (!allPositionRankings) return [];
    const positionData = allPositionRankings[selectedPosition];
    return sortByRankingType(positionData, selectedRankingType);
  }, [allPositionRankings, selectedPosition, selectedRankingType]);

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
        <ErrorMessage message="랭킹을 불러올 수 없습니다" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">라인별 랭킹</h1>
        <p className="text-gray-300">
          각 포지션에서 3경기 이상 플레이한 선수만 표시됩니다
        </p>
      </div>

      <PositionTabs selected={selectedPosition} onSelect={setSelectedPosition} />

      <RankingTypeTabs
        selected={selectedRankingType}
        onSelect={setSelectedRankingType}
      />

      <PositionRankingTable
        rankings={currentRankings}
        rankingType={selectedRankingType}
      />
    </div>
  );
}

/**
 * 챔피언 통계 데이터 조회 훅
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import {
  ChampionStatsResponse,
  ChampionWinRateStats,
  ChampionBanStats,
} from "../api/types";

interface ChampionStatsData {
  winRateStats: ChampionWinRateStats[];
  banRateStats: ChampionBanStats[];
}

async function fetchChampionStats(): Promise<ChampionStatsData> {
  const response = await apiClient.get<ChampionStatsResponse>(
    "/champions/stats"
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "챔피언 통계 조회 실패");
  }

  return response.data;
}

export function useChampionStats() {
  return useQuery({
    queryKey: ["championStats"],
    queryFn: fetchChampionStats,
    staleTime: 5 * 60 * 1000, // 5분간 캐시
  });
}

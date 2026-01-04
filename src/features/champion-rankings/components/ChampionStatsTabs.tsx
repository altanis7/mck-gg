/**
 * 챔피언 통계 탭 컴포넌트 (승률/밴률)
 */

"use client";

import { ChampionStatsTab } from "../api/types";
import { cn } from "@/lib/utils";

interface ChampionStatsTabsProps {
  selected: ChampionStatsTab;
  onSelect: (tab: ChampionStatsTab) => void;
}

const tabs: { value: ChampionStatsTab; label: string }[] = [
  { value: "winRate", label: "승률" },
  { value: "banRate", label: "밴률" },
];

export function ChampionStatsTabs({ selected, onSelect }: ChampionStatsTabsProps) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onSelect(tab.value)}
          className={cn(
            "px-6 py-2.5 rounded-lg font-semibold transition-colors whitespace-nowrap flex-shrink-0",
            selected === tab.value
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}


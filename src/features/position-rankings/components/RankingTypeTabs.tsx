/**
 * 랭킹 타입 선택 탭 컴포넌트
 */

"use client";

import { RankingType } from "../api/types";
import { cn } from "@/lib/utils";

interface RankingTypeTabsProps {
  selected: RankingType;
  onSelect: (type: RankingType) => void;
}

const rankingTypes: { key: RankingType; label: string }[] = [
  { key: "winRate", label: "승률" },
  { key: "damage", label: "딜량" },
];

export function RankingTypeTabs({ selected, onSelect }: RankingTypeTabsProps) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {rankingTypes.map((type) => (
        <button
          key={type.key}
          onClick={() => onSelect(type.key)}
          className={cn(
            "px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0",
            selected === type.key
              ? "bg-slate-700 text-white"
              : "bg-slate-800 text-gray-400 hover:bg-slate-700"
          )}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}

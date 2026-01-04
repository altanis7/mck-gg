/**
 * 포지션 선택 탭 컴포넌트
 */

"use client";

import { Position } from "../api/types";
import { getPositionKorean } from "@/features/members/utils/statsCalculations";
import { cn } from "@/lib/utils";

interface PositionTabsProps {
  selected: Position;
  onSelect: (position: Position) => void;
}

const positions: Position[] = ["top", "jungle", "mid", "adc", "support"];

export function PositionTabs({ selected, onSelect }: PositionTabsProps) {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
      {positions.map((position) => (
        <button
          key={position}
          onClick={() => onSelect(position)}
          className={cn(
            "px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap flex-shrink-0",
            selected === position
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          )}
        >
          {getPositionKorean(position)}
        </button>
      ))}
    </div>
  );
}

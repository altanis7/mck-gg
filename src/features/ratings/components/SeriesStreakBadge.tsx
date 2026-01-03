/**
 * Series Streak Badge - 게임풍 화려한 시리즈 연승/연패 배지
 *
 * Features:
 * - 그라데이션 배경 (연승: 노랑→주황→빨강, 연패: 빨강→보라→핑크)
 * - Glow/Shadow 효과
 * - Pulse 애니메이션
 * - 3D 입체감 (inset highlight)
 * - 불꽃/번개 아이콘
 */

import { cn } from "@/lib/utils";
import { Flame, Zap, TrendingDown } from "lucide-react";

interface SeriesStreakBadgeProps {
  streak: number; // 양수 = 연승, 음수 = 연패
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  showLabel?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    container: "px-2 py-1 text-xs gap-1",
    icon: 12,
    fontSize: "text-xs",
  },
  md: {
    container: "px-3 py-1.5 text-sm gap-1.5",
    icon: 16,
    fontSize: "text-sm",
  },
  lg: {
    container: "px-4 py-2 text-base gap-2",
    icon: 20,
    fontSize: "text-base",
  },
  xl: {
    container: "px-6 py-3 text-lg gap-3",
    icon: 28,
    fontSize: "text-lg",
  },
};

export function SeriesStreakBadge({
  streak,
  size = "md",
  animated = true,
  showLabel = true,
  className,
}: SeriesStreakBadgeProps) {
  // 3시리즈 미만이면 표시 안 함
  if (Math.abs(streak) < 3) return null;

  const isWinStreak = streak > 0;
  const streakCount = Math.abs(streak);
  const config = SIZE_CONFIG[size];

  // 연승: 황금 그라데이션 (불타는 효과)
  // 연패: 빨강-보라 그라데이션 (어두운 느낌)
  const gradientClass = isWinStreak
    ? "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500"
    : "bg-gradient-to-r from-red-600 via-purple-600 to-pink-600";

  const glowClass = isWinStreak
    ? "shadow-[0_0_20px_rgba(251,191,36,0.6)]"
    : "shadow-[0_0_20px_rgba(220,38,38,0.6)]";

  // 아이콘 선택
  const Icon = isWinStreak ? Flame : streak < -5 ? Zap : TrendingDown;

  return (
    <div
      className={cn(
        // Base styles
        "inline-flex items-center justify-center font-bold rounded-lg",
        "relative overflow-hidden",
        config.container,

        // 그라데이션 배경
        gradientClass,

        // Glow 효과
        glowClass,

        // 3D 효과 + 그림자
        "shadow-lg",

        // 호버 효과
        "transform hover:scale-105 transition-transform duration-200",

        // 애니메이션
        animated && "animate-pulse",

        className
      )}
      style={{
        // 추가 glow 효과 (inline style)
        boxShadow: isWinStreak
          ? "0 0 30px rgba(251, 191, 36, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.3)"
          : "0 0 30px rgba(220, 38, 38, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.2)",
      }}
    >
      {/* 반짝이 레이어 (3D 입체감) */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* 콘텐츠 */}
      <div className="relative flex items-center gap-1.5 z-10 text-white drop-shadow-lg">
        <Icon size={config.icon} className={animated ? "animate-bounce" : ""} />
        {showLabel && (
          <span className={config.fontSize}>
            {streakCount} {isWinStreak ? "연승" : "연패"}
          </span>
        )}
      </div>
    </div>
  );
}

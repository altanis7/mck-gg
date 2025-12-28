/**
 * 티어 뱃지 컴포넌트
 *
 * ELO 티어를 표시하는 뱃지 (아이콘 + 이름)
 */

import Image from 'next/image';
import { TierConfig } from '../api/types';
import { cn } from '@/lib/utils';

interface TierBadgeProps {
  tierConfig: TierConfig;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showStreak?: boolean;
  currentStreak?: number;
  className?: string;
}

const SIZE_MAP = {
  sm: { icon: 20, text: 'text-xs' },
  md: { icon: 28, text: 'text-sm' },
  lg: { icon: 36, text: 'text-base' },
};

function getStreakLabel(tierName: string, streak: number): string {
  if (streak === 0) return tierName;

  const absStreak = Math.abs(streak);
  const streakType = streak > 0 ? '연승' : '연패';

  return `${absStreak}${tierName} ${streakType}`;
}

export function TierBadge({
  tierConfig,
  size = 'md',
  showName = true,
  showStreak = false,
  currentStreak = 0,
  className,
}: TierBadgeProps) {
  const sizeConfig = SIZE_MAP[size];
  const displayText = showStreak && showName
    ? getStreakLabel(tierConfig.name, currentStreak)
    : tierConfig.name;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="relative flex-shrink-0">
        <Image
          src={tierConfig.icon}
          alt={tierConfig.name}
          width={sizeConfig.icon}
          height={sizeConfig.icon}
          className="object-contain"
        />
      </div>

      {showName && (
        <span
          className={cn('font-semibold', sizeConfig.text)}
          style={{ color: tierConfig.color }}
        >
          {displayText}
        </span>
      )}
    </div>
  );
}

/**
 * 티어 시스템 유틸리티
 *
 * 순위 백분율 기반으로 티어를 계산합니다.
 * 정규분포 방식: 실버/골드에 가장 많은 인원 배치
 */

import { EloTier, TierConfig } from '../api/types';

// 티어 설정 (정규분포: 실버/골드 중심)
export const TIER_CONFIG: TierConfig[] = [
  {
    name: 'CHALLENGER',
    minPercentile: 0,
    maxPercentile: 5,
    color: '#F4E14C',
    icon: '/tier/챌린저.webp',
  },
  {
    name: 'DIAMOND',
    minPercentile: 5,
    maxPercentile: 20,
    color: '#5BC0DE',
    icon: '/tier/다이아몬드.webp',
  },
  {
    name: 'PLATINUM',
    minPercentile: 20,
    maxPercentile: 45,
    color: '#5CB85C',
    icon: '/tier/플래티넘.webp',
  },
  {
    name: 'GOLD',
    minPercentile: 45,
    maxPercentile: 70,
    color: '#F0AD4E',
    icon: '/tier/골드.webp',
  },
  {
    name: 'SILVER',
    minPercentile: 70,
    maxPercentile: 90,
    color: '#999999',
    icon: '/tier/실버.webp',
  },
  {
    name: 'BRONZE',
    minPercentile: 90,
    maxPercentile: 100,
    color: '#CD7F32',
    icon: '/tier/브론즈.webp',
  },
];

/**
 * 순위 백분율 계산
 *
 * @param ranking 현재 순위 (1부터 시작)
 * @param totalPlayers 전체 플레이어 수
 * @returns 상위 백분율 (0~100)
 *
 * @example
 * calculatePercentile(1, 100) // 0 (상위 0%)
 * calculatePercentile(50, 100) // 49 (상위 49%)
 * calculatePercentile(100, 100) // 99 (상위 99%, 하위 1%)
 */
export function calculatePercentile(
  ranking: number,
  totalPlayers: number
): number {
  if (totalPlayers <= 1) return 0;

  // 백분율 = (순위 - 1) / (전체 인원 - 1) * 100
  const percentile = ((ranking - 1) / (totalPlayers - 1)) * 100;
  return Math.max(0, Math.min(100, percentile));
}

/**
 * 순위 백분율 기반 티어 결정
 *
 * @param ranking 현재 순위 (1부터 시작)
 * @param totalPlayers 전체 플레이어 수
 * @returns 티어 설정
 *
 * @example
 * getTierByPercentile(1, 30) // CHALLENGER (상위 0%)
 * getTierByPercentile(15, 30) // GOLD (상위 48.3%)
 * getTierByPercentile(28, 30) // BRONZE (상위 93.1%)
 */
export function getTierByPercentile(
  ranking: number,
  totalPlayers: number
): TierConfig {
  const percentile = calculatePercentile(ranking, totalPlayers);

  const tier = TIER_CONFIG.find(
    (t) => percentile >= t.minPercentile && percentile < t.maxPercentile
  );

  // 100%인 경우 (마지막 순위) BRONZE 반환
  return tier ?? TIER_CONFIG[TIER_CONFIG.length - 1];
}

/**
 * 티어 이름으로 티어 설정 조회
 *
 * @param tierName 티어 이름
 * @returns 티어 설정 (없으면 undefined)
 */
export function getTierByName(tierName: EloTier): TierConfig | undefined {
  return TIER_CONFIG.find((tier) => tier.name === tierName);
}

/**
 * 모든 티어 목록 반환
 *
 * @returns 티어 설정 배열 (상위 순)
 */
export function getAllTiers(): TierConfig[] {
  return TIER_CONFIG;
}

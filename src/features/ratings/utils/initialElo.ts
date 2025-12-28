/**
 * 초기 ELO 매핑 유틸리티
 *
 * 솔로랭크 티어 기반으로 신규 멤버의 초기 ELO 점수를 결정합니다.
 */

// 솔로랭크 티어별 초기 ELO 매핑
export const INITIAL_ELO_MAP: Record<string, number> = {
  IRON: 1000,
  BRONZE: 1100,
  SILVER: 1200,
  GOLD: 1300,
  PLATINUM: 1400,
  EMERALD: 1450,
  DIAMOND: 1500,
  MASTER: 1600,
  GRANDMASTER: 1700,
  CHALLENGER: 1800,
};

// 기본 ELO (티어 정보가 없거나 언랭인 경우)
export const DEFAULT_ELO = 1200;

// ELO 범위
export const MIN_ELO = 1000;
export const MAX_ELO = 2000;

/**
 * 솔로랭크 티어 기반 초기 ELO 반환
 *
 * @param soloTier 솔로랭크 티어 (예: "GOLD", "Diamond", "plAtInUm")
 * @returns 초기 ELO 점수 (1000~1800)
 *
 * @example
 * getInitialElo("GOLD") // 1300
 * getInitialElo("diamond") // 1500
 * getInitialElo() // 1200 (기본값)
 */
export function getInitialElo(soloTier?: string | null): number {
  if (!soloTier) return DEFAULT_ELO;

  const normalizedTier = soloTier.toUpperCase();
  return INITIAL_ELO_MAP[normalizedTier] ?? DEFAULT_ELO;
}

/**
 * ELO 점수를 유효 범위로 제한
 *
 * @param elo ELO 점수
 * @returns 1000~2000 범위로 제한된 ELO 점수
 */
export function clampElo(elo: number): number {
  return Math.max(MIN_ELO, Math.min(MAX_ELO, elo));
}

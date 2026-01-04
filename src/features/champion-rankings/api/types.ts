/**
 * 챔피언 랭킹 타입 정의
 */

// 챔피언 통계 탭 타입
export type ChampionStatsTab = 'winRate' | 'banRate';

// 챔피언 승률 통계
export interface ChampionWinRateStats {
  championName: string;
  picks: number;        // 픽 수
  wins: number;         // 승리 수
  losses: number;       // 패배 수
  winRate: number;      // 승률 (0-100)
  totalGames: number;   // 총 게임 수 (=picks)
}

// 챔피언 밴률 통계
export interface ChampionBanStats {
  championName: string;
  bans: number;         // 밴 수
  totalGames: number;   // 총 게임 수
  banRate: number;      // 밴률 (0-100)
}

// API 응답 타입
export interface ChampionStatsResponse {
  success: boolean;
  data?: {
    winRateStats: ChampionWinRateStats[];
    banRateStats: ChampionBanStats[];
  };
  error?: string;
}



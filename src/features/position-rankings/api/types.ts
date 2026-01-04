/**
 * 포지션별 랭킹 타입 정의
 */

// 포지션 타입
export type Position = 'top' | 'jungle' | 'mid' | 'adc' | 'support';

// 랭킹 타입
export type RankingType = 'winRate' | 'damage';

// 포지션별 개인 랭킹 데이터
export interface PositionRanking {
  memberId: string;
  memberName: string;
  summonerName: string;
  position: Position;

  // 기본 통계
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;

  // KDA
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgKda: number;

  // 딜량 & CS
  totalDamage: number;
  avgDamage: number;
  totalCS: number;
  avgCS: number;
}

// 포지션별 랭킹 맵
export type PositionRankingsMap = {
  [key in Position]: PositionRanking[];
};

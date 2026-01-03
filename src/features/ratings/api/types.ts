// ============================================
// ELO 랭킹 시스템 타입 정의
// ============================================

// ============================================
// Entity 타입
// ============================================

// MemberRating 타입 (ELO 히스토리)
export interface MemberRating {
  id: string;
  member_id: string;
  game_id: string;

  // ELO 점수
  elo_rating: number;
  previous_rating: number;
  rating_change: number;

  // 순위 변동
  ranking_before: number;
  ranking_after: number;

  // 게임 정보
  team: 'blue' | 'red';
  won: boolean;

  // 연승/연패 추적
  streak_before: number;
  streak_after: number;
  streak_bonus: number;

  created_at: string;
}

// MemberRanking 타입 (랭킹 정보, DB 뷰에서 반환)
export interface MemberRanking {
  id: string;
  name: string;
  summoner_name: string;
  solo_tier?: string;
  solo_rank?: string;
  current_elo: number;
  peak_elo: number;
  total_games: number;
  total_wins: number;
  current_streak: number;
  current_series_streak: number; // 시리즈 기준 연승/연패
  ranking: number;
  win_rate: number;
  is_guest?: boolean;
  topChampions?: ChampionStats[];
  lastGameDate?: string;
  avgKda?: number;
  avgKills?: number;
  avgDeaths?: number;
  avgAssists?: number;
  rankingChange?: number;
}

// 티어 타입
export type EloTier =
  | 'CHALLENGER'
  | 'DIAMOND'
  | 'PLATINUM'
  | 'GOLD'
  | 'SILVER'
  | 'BRONZE';

// 티어 설정 타입
export interface TierConfig {
  name: EloTier;
  minPercentile: number;    // 최소 백분율 (상위 %)
  maxPercentile: number;    // 최대 백분율 (상위 %)
  color: string;
  icon: string;
}

// 챔피언 통계 타입
export interface ChampionStats {
  championName: string;
  gamesPlayed: number;
}

// MemberRankingWithTier 타입 (프론트엔드용, 티어 포함)
export interface MemberRankingWithTier extends MemberRanking {
  tier: EloTier;
  tierConfig: TierConfig;
  topChampions: ChampionStats[];
  lastGameDate?: string;
  avgKda?: number;
  avgKills?: number;
  avgDeaths?: number;
  avgAssists?: number;
  rankingChange?: number; // 순위 변동 (양수: 상승, 음수: 하락, 0: 변동없음)
}

// RatingChange 타입 (ELO 계산 결과)
export interface RatingChange {
  memberId: string;
  memberName: string;
  team: 'blue' | 'red';
  previousElo: number;
  newElo: number;
  change: number;
  rankingBefore: number;
  rankingAfter: number;
  streakBonus: number;
  won: boolean;
}

// ============================================
// DTO 타입
// ============================================

// ELO 계산 요청
export interface CalculateRatingsDto {
  gameId: string;
}

// ============================================
// API 응답 타입
// ============================================

// 랭킹 목록 응답
export interface RatingsResponse {
  success: boolean;
  data?: MemberRanking[];
  totalPlayers?: number;    // 클라이언트가 백분율 계산에 사용
  error?: string;
}

// 티어 포함 랭킹 목록 응답 (프론트엔드용)
export interface RatingsWithTierResponse {
  success: boolean;
  data?: MemberRankingWithTier[];
  totalPlayers?: number;
  error?: string;
}

// 개인 ELO 히스토리 응답
export interface RatingHistoryResponse {
  success: boolean;
  data?: MemberRating[];
  error?: string;
}

// ELO 계산 응답
export interface CalculateRatingsResponse {
  success: boolean;
  data?: RatingChange[];
  error?: string;
}

// ============================================
// 유틸리티 타입
// ============================================

// ELO 변동 계산 파라미터
export interface CalculateEloChangeParams {
  currentElo: number;
  teamAvgElo: number;
  opponentAvgElo: number;
  won: boolean;
  currentStreak: number;
  totalGames: number;
}

// ELO 변동 계산 결과
export interface CalculateEloChangeResult {
  newElo: number;
  change: number;
  streakBonus: number;
  newStreak: number;
}

// 멤버 ELO 정보 (계산용)
export interface MemberEloInfo {
  id: string;
  name: string;
  summoner_name: string;
  solo_tier?: string;
  current_elo: number | null;
  peak_elo: number | null;
  total_games: number | null;
  total_wins: number | null;
  current_streak: number | null;
}

// 게임 참가자 정보
export interface GameParticipant {
  member_id: string;
  team: 'blue' | 'red';
  position: 'top' | 'jungle' | 'mid' | 'adc' | 'support';
}

// ============================================
// 시리즈 연승/연패 시스템 타입
// ============================================

// 시리즈 참가 기록
export interface SeriesParticipation {
  id: string;
  member_id: string;
  match_series_id: string;
  won: boolean | null; // NULL: 미완료, TRUE: 승리, FALSE: 패배
  team: 'blue' | 'red';
  created_at: string;
  updated_at: string;
}

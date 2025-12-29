import { TierConfig } from '@/features/ratings/api/types';

// Member 타입
export interface Member {
  id: string;
  name: string;
  summoner_name: string;
  riot_id: string;
  solo_tier?: string;
  solo_rank?: string;
  main_position: string;
  sub_position?: string;
  is_guest: boolean;
  created_at: string;
  updated_at: string;
}

// 멤버 생성 DTO
export interface CreateMemberDto {
  name: string;
  summoner_name: string;
  riot_id: string;
  solo_tier?: string;
  solo_rank?: string;
  main_position: string;
  sub_position?: string;
  is_guest?: boolean;
}

// 멤버 수정 DTO
export interface UpdateMemberDto {
  name?: string;
  summoner_name?: string;
  riot_id?: string;
  solo_tier?: string;
  solo_rank?: string;
  main_position?: string;
  sub_position?: string;
  is_guest?: boolean;
}

// API 응답 타입
export interface MembersResponse {
  success: boolean;
  data?: Member[];
  error?: string;
}

export interface MemberResponse {
  success: boolean;
  data?: Member;
  error?: string;
}

export interface DeleteMemberResponse {
  success: boolean;
  error?: string;
}

// 챔피언별 통계
export interface PlayerChampionStats {
  championName: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKda: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgCs: number;
  avgDamage: number;
}

// 포지션별 통계
export interface PlayerPositionStats {
  position: 'top' | 'jungle' | 'mid' | 'adc' | 'support';
  games: number;
  wins: number;
  winRate: number;
}

// 전체 플레이어 통계
export interface PlayerOverallStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  currentElo: number;
  peakElo: number;
  currentStreak: number;
  avgKda: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgCs: number;
  avgDamage: number;
}

// 플레이어 경기 상세 정보
export interface PlayerMatchDetail {
  game: any; // GameDetail 타입 (matches 기능에서 가져옴)
  playerResult: any; // GameResult 타입
  teammates: any[]; // GameResult[] 타입
  enemies: any[]; // GameResult[] 타입
  eloChange: number;
  matchDate: string;
}

// 멤버 통계 데이터
export interface MemberStatsData {
  member: Member;
  stats: PlayerOverallStats;
  topChampions: PlayerChampionStats[];
  positionStats: PlayerPositionStats[];
  recentMatches: PlayerMatchDetail[];
  eloHistory: any[]; // MemberRating[] 타입 (ratings 기능에서 가져옴)
  tierConfig: TierConfig;
}

// 멤버 통계 응답
export interface MemberStatsResponse {
  success: boolean;
  data?: MemberStatsData;
  error?: string;
}

// Match 타입 (경기)
export interface Match {
  id: string;
  match_date: string;
  duration: number; // 초 단위
  winning_team: 'blue' | 'red';
  screenshot_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// GameResult 타입 (개인 경기 결과)
export interface GameResult {
  id: string;
  match_id: string;
  member_id: string;

  // 기본 정보
  team: 'blue' | 'red';
  position: 'top' | 'jungle' | 'mid' | 'adc' | 'support';
  champion_name: string;

  // KDA 통계
  kills: number;
  deaths: number;
  assists: number;
  max_kill_streak?: number;
  max_multikill?: number;

  // 특수 이벤트
  first_blood?: boolean;

  // CS 통계
  cs: number;
  neutral_monsters_killed?: number;

  // 피해량 통계
  champion_damage: number;
  turret_damage?: number;
  objective_damage?: number;
  damage_taken: number;

  // 힐 및 방어 통계
  healing?: number;
  damage_reduction?: number;

  // CC 통계
  cc_score?: number;

  // 골드 통계
  gold_earned: number;
  gold_spent?: number;

  // 시야 통계
  vision_score: number;
  wards_placed: number;
  wards_destroyed: number;
  control_wards_purchased?: number;

  // 오브젝트 통계
  turret_kills?: number;
  inhibitor_kills?: number;

  created_at: string;
  updated_at: string;
}

// 경기 생성 DTO
export interface CreateMatchDto {
  match_date: string; // ISO 8601 형식
  duration: number;
  winning_team: 'blue' | 'red';
  screenshot_url?: string;
  notes?: string;
}

// 경기 수정 DTO
export interface UpdateMatchDto {
  match_date?: string;
  duration?: number;
  winning_team?: 'blue' | 'red';
  screenshot_url?: string;
  notes?: string;
}

// 개인 경기 결과 생성 DTO
export interface CreateGameResultDto {
  match_id: string;
  member_id: string;
  team: 'blue' | 'red';
  position: 'top' | 'jungle' | 'mid' | 'adc' | 'support';
  champion_name: string;
  kills: number;
  deaths: number;
  assists: number;
  max_kill_streak?: number;
  max_multikill?: number;
  first_blood?: boolean;
  cs: number;
  neutral_monsters_killed?: number;
  champion_damage: number;
  turret_damage?: number;
  objective_damage?: number;
  damage_taken: number;
  healing?: number;
  damage_reduction?: number;
  cc_score?: number;
  gold_earned: number;
  gold_spent?: number;
  vision_score: number;
  wards_placed: number;
  wards_destroyed: number;
  control_wards_purchased?: number;
  turret_kills?: number;
  inhibitor_kills?: number;
}

// 개인 경기 결과 수정 DTO
export interface UpdateGameResultDto {
  team?: 'blue' | 'red';
  position?: 'top' | 'jungle' | 'mid' | 'adc' | 'support';
  champion_name?: string;
  kills?: number;
  deaths?: number;
  assists?: number;
  max_kill_streak?: number;
  max_multikill?: number;
  first_blood?: boolean;
  cs?: number;
  neutral_monsters_killed?: number;
  champion_damage?: number;
  turret_damage?: number;
  objective_damage?: number;
  damage_taken?: number;
  healing?: number;
  damage_reduction?: number;
  cc_score?: number;
  gold_earned?: number;
  gold_spent?: number;
  vision_score?: number;
  wards_placed?: number;
  wards_destroyed?: number;
  control_wards_purchased?: number;
  turret_kills?: number;
  inhibitor_kills?: number;
}

// API 응답 타입
export interface MatchesResponse {
  success: boolean;
  data?: Match[];
  error?: string;
}

export interface MatchResponse {
  success: boolean;
  data?: Match;
  error?: string;
}

export interface GameResultsResponse {
  success: boolean;
  data?: GameResult[];
  error?: string;
}

export interface GameResultResponse {
  success: boolean;
  data?: GameResult;
  error?: string;
}

export interface DeleteMatchResponse {
  success: boolean;
  error?: string;
}

export interface DeleteGameResultResponse {
  success: boolean;
  error?: string;
}

// 경기 상세 정보 (경기 + 모든 개인 결과)
export interface MatchDetail extends Match {
  game_results: GameResult[];
}

export interface MatchDetailResponse {
  success: boolean;
  data?: MatchDetail;
  error?: string;
}

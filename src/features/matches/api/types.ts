// ============================================
// 시리즈/게임 타입 (새 구조)
// ============================================

// MatchSeries 타입 (시리즈)
export interface MatchSeries {
  id: string;
  series_date: string;
  series_type: 'bo1' | 'bo3' | 'bo5';
  series_status: 'scheduled' | 'ongoing' | 'completed';
  winner_team?: 'blue' | 'red' | 'team_a' | 'team_b';
  blue_wins: number;
  red_wins: number;
  team_a_wins: number;  // 첫 게임 블루팀 기준
  team_b_wins: number;  // 첫 게임 레드팀 기준
  screenshot_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Game 타입 (시리즈 내 개별 게임)
export interface Game {
  id: string;
  match_series_id: string;
  game_number: number;
  game_status: 'not_started' | 'in_progress' | 'completed';
  winning_team?: 'blue' | 'red';
  duration?: number; // 초 단위
  screenshot_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// BanPick 타입 (게임별 밴픽)
export interface BanPick {
  id: string;
  game_id: string;
  team: 'blue' | 'red';
  phase: 'ban' | 'pick';
  order_number: number;
  champion_name: string;
  position?: 'top' | 'jungle' | 'mid' | 'adc' | 'support';
  selected_by_member_id?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// 역호환성 타입 (기존 Match)
// ============================================

// Match 타입 (경기) - 역호환성 유지
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
  game_id: string; // match_id에서 game_id로 변경
  member_id: string;

  // 기본 정보
  team: 'blue' | 'red';
  position: 'top' | 'jungle' | 'mid' | 'adc' | 'support';
  champion_name: string;

  // 조인된 멤버 정보 (선택적)
  members?: {
    name: string;
    summoner_name: string;
  };

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

// ============================================
// DTO 타입 (시리즈/게임)
// ============================================

// 시리즈 생성 DTO
export interface CreateMatchSeriesDto {
  series_date: string; // ISO 8601 형식
  series_type: 'bo1' | 'bo3' | 'bo5';
  notes?: string;
}

// 시리즈 수정 DTO
export interface UpdateMatchSeriesDto {
  series_date?: string;
  series_status?: 'scheduled' | 'ongoing' | 'completed';
  winner_team?: 'blue' | 'red' | 'team_a' | 'team_b';
  blue_wins?: number;
  red_wins?: number;
  team_a_wins?: number;
  team_b_wins?: number;
  screenshot_url?: string;
  notes?: string;
}

// 게임 생성 DTO
export interface CreateGameDto {
  match_series_id: string;
  game_number: number;
}

// 게임 수정 DTO
export interface UpdateGameDto {
  game_status?: 'not_started' | 'in_progress' | 'completed';
  winning_team?: 'blue' | 'red';
  duration?: number;
  screenshot_url?: string;
  notes?: string;
}

// 밴픽 생성 DTO
export interface CreateBanPickDto {
  game_id: string;
  team: 'blue' | 'red';
  phase: 'ban' | 'pick';
  order_number: number;
  champion_name: string;
  position?: 'top' | 'jungle' | 'mid' | 'adc' | 'support';
  selected_by_member_id?: string;
}

// ============================================
// 역호환성 DTO (기존 Match)
// ============================================

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
  game_id?: string; // 선택적 (URL 파라미터로 전달될 수도 있음)
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

// ============================================
// API 응답 타입 (시리즈/게임)
// ============================================

// 시리즈 응답
export interface MatchSeriesResponse {
  success: boolean;
  data?: MatchSeries;
  error?: string;
}

export interface MatchSeriesListResponse {
  success: boolean;
  data?: MatchSeries[];
  error?: string;
}

// 게임 응답
export interface GameResponse {
  success: boolean;
  data?: Game;
  error?: string;
}

export interface GameListResponse {
  success: boolean;
  data?: Game[];
  error?: string;
}

// 밴픽 응답
export interface BanPickResponse {
  success: boolean;
  data?: BanPick;
  error?: string;
}

export interface BanPickListResponse {
  success: boolean;
  data?: BanPick[];
  error?: string;
}

// 상세 조회 타입
export interface GameDetail extends Game {
  game_results: GameResult[];
  ban_picks: BanPick[];
}

export interface MatchSeriesDetail extends MatchSeries {
  games: GameDetail[];
}

export interface MatchSeriesDetailResponse {
  success: boolean;
  data?: MatchSeriesDetail;
  error?: string;
}

export interface GameDetailResponse {
  success: boolean;
  data?: GameDetail;
  error?: string;
}

// ============================================
// 역호환성 API 응답 타입
// ============================================

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

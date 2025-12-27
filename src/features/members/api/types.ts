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

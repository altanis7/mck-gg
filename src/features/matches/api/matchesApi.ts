import { apiClient } from '@/lib/axios';
import {
  Match,
  MatchesResponse,
  MatchResponse,
  MatchDetailResponse,
  CreateMatchDto,
  UpdateMatchDto,
  DeleteMatchResponse,
} from './types';

// 경기 목록 조회
export async function getMatches(): Promise<MatchesResponse> {
  return await apiClient.get<MatchesResponse>('/matches');
}

// 경기 상세 조회 (개인 결과 포함)
export async function getMatch(id: string): Promise<MatchDetailResponse> {
  return await apiClient.get<MatchDetailResponse>(`/matches/${id}`);
}

// 경기 생성
export async function createMatch(
  matchData: CreateMatchDto
): Promise<MatchResponse> {
  return await apiClient.post<MatchResponse>('/matches', matchData);
}

// 경기 수정
export async function updateMatch(
  id: string,
  matchData: UpdateMatchDto
): Promise<MatchResponse> {
  return await apiClient.patch<MatchResponse>(`/matches/${id}`, matchData);
}

// 경기 삭제
export async function deleteMatch(id: string): Promise<DeleteMatchResponse> {
  return await apiClient.delete<DeleteMatchResponse>(`/matches/${id}`);
}

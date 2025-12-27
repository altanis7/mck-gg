import { apiClient } from '@/lib/axios';
import {
  MatchSeriesListResponse,
  MatchSeriesResponse,
  MatchSeriesDetailResponse,
  CreateMatchSeriesDto,
  UpdateMatchSeriesDto,
} from './types';

// 시리즈 목록 조회
export async function getMatchSeries(): Promise<MatchSeriesListResponse> {
  return await apiClient.get<MatchSeriesListResponse>('/match-series');
}

// 시리즈 상세 조회 (games, ban_picks, game_results 포함)
export async function getMatchSeriesDetail(
  id: string
): Promise<MatchSeriesDetailResponse> {
  return await apiClient.get<MatchSeriesDetailResponse>(`/match-series/${id}`);
}

// 시리즈 생성
export async function createMatchSeries(
  seriesData: CreateMatchSeriesDto
): Promise<MatchSeriesResponse> {
  return await apiClient.post<MatchSeriesResponse>('/match-series', seriesData);
}

// 시리즈 수정
export async function updateMatchSeries(
  id: string,
  seriesData: UpdateMatchSeriesDto
): Promise<MatchSeriesResponse> {
  return await apiClient.patch<MatchSeriesResponse>(`/match-series/${id}`, seriesData);
}

// 시리즈 삭제
export async function deleteMatchSeries(
  id: string
): Promise<MatchSeriesResponse> {
  return await apiClient.delete<MatchSeriesResponse>(`/match-series/${id}`);
}

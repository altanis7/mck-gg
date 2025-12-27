import { apiClient } from '@/lib/axios';
import {
  GameResult,
  GameResultsResponse,
  GameResultResponse,
  CreateGameResultDto,
  UpdateGameResultDto,
  DeleteGameResultResponse,
} from './types';

// 특정 경기의 모든 개인 결과 조회
export async function getGameResults(
  matchId: string
): Promise<GameResultsResponse> {
  return await apiClient.get<GameResultsResponse>(`/matches/${matchId}/game-results`);
}

// 개인 경기 결과 생성
export async function createGameResult(
  matchId: string,
  resultData: CreateGameResultDto
): Promise<GameResultResponse> {
  return await apiClient.post<GameResultResponse>(
    `/matches/${matchId}/game-results`,
    resultData
  );
}

// 개인 경기 결과 수정
export async function updateGameResult(
  id: string,
  resultData: UpdateGameResultDto
): Promise<GameResultResponse> {
  return await apiClient.patch<GameResultResponse>(`/game-results/${id}`, resultData);
}

// 개인 경기 결과 삭제
export async function deleteGameResult(
  id: string
): Promise<DeleteGameResultResponse> {
  return await apiClient.delete<DeleteGameResultResponse>(`/game-results/${id}`);
}

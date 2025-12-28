/**
 * ELO 랭킹 API 클라이언트
 */

import {
  RatingsResponse,
  RatingHistoryResponse,
  CalculateRatingsResponse,
  MemberRanking,
  MemberRating,
  RatingChange,
} from './types';

const API_BASE = '/api/ratings';

/**
 * 전체 랭킹 조회
 * @returns 멤버 랭킹 목록 + 총 플레이어 수
 */
export async function getRankings(): Promise<{
  rankings: MemberRanking[];
  totalPlayers: number;
}> {
  const response = await fetch(API_BASE);
  const result: RatingsResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || '랭킹 조회 실패');
  }

  return {
    rankings: result.data,
    totalPlayers: result.totalPlayers ?? result.data.length,
  };
}

/**
 * 개인 ELO 히스토리 조회
 * @param memberId 멤버 ID
 * @returns ELO 히스토리 목록 (최신순)
 */
export async function getMemberRatingHistory(
  memberId: string
): Promise<MemberRating[]> {
  const response = await fetch(`${API_BASE}/${memberId}`);
  const result: RatingHistoryResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'ELO 히스토리 조회 실패');
  }

  return result.data;
}

/**
 * 게임 완료 후 ELO 계산 (관리자 전용)
 * @param gameId 게임 ID
 * @returns 플레이어별 ELO 변동 정보
 */
export async function calculateRatings(
  gameId: string
): Promise<RatingChange[]> {
  const response = await fetch(`${API_BASE}/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ gameId }),
  });

  const result: CalculateRatingsResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'ELO 계산 실패');
  }

  return result.data;
}

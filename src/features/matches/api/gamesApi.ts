import {
  GameResponse,
  GameListResponse,
  GameDetailResponse,
  CreateGameResultDto,
  GameResultResponse,
  GameResultsResponse,
} from './types';

/**
 * 게임 생성
 */
export async function createGame(data: {
  match_series_id: string;
  game_number: number;
  duration?: number;
  winning_team?: 'blue' | 'red';
  notes?: string;
}): Promise<GameResponse> {
  const response = await fetch('/api/games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
}

/**
 * 게임 목록 조회 (특정 시리즈의 게임들)
 */
export async function getGames(
  match_series_id: string
): Promise<GameListResponse> {
  const response = await fetch(
    `/api/games?match_series_id=${match_series_id}`
  );
  return await response.json();
}

/**
 * 게임 상세 조회
 */
export async function getGameDetail(id: string): Promise<GameDetailResponse> {
  const response = await fetch(`/api/games/${id}`);
  return await response.json();
}

/**
 * 게임 수정
 */
export async function updateGame(
  id: string,
  data: {
    game_status?: 'not_started' | 'in_progress' | 'completed';
    winning_team?: 'blue' | 'red';
    duration?: number;
    screenshot_url?: string;
    notes?: string;
  }
): Promise<GameResponse> {
  const response = await fetch(`/api/games/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
}

/**
 * 게임 삭제
 */
export async function deleteGame(id: string): Promise<GameResponse> {
  const response = await fetch(`/api/games/${id}`, {
    method: 'DELETE',
  });
  return await response.json();
}

/**
 * 게임 결과 조회
 */
export async function getGameResults(
  gameId: string
): Promise<GameResultsResponse> {
  const response = await fetch(`/api/games/${gameId}/game-results`);
  return await response.json();
}

/**
 * 게임 결과 추가 (단일)
 */
export async function addGameResult(
  gameId: string,
  result: CreateGameResultDto
): Promise<GameResultResponse> {
  const response = await fetch(`/api/games/${gameId}/game-results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  });
  return await response.json();
}

/**
 * 게임 결과 일괄 추가 (10명)
 */
export async function addGameResults(
  gameId: string,
  results: CreateGameResultDto[]
): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const promises = results.map((result) => addGameResult(gameId, result));
    const responses = await Promise.all(promises);

    // 하나라도 실패하면 전체 실패로 간주
    const failed = responses.find((r) => !r.success);
    if (failed) {
      return { success: false, error: failed.error || '게임 결과 저장 실패' };
    }

    return {
      success: true,
      data: responses.map((r) => r.data),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '게임 결과 저장 실패',
    };
  }
}

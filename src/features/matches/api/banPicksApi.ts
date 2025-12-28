import { BanPickResponse, CreateBanPickDto } from './types';

/**
 * 밴픽 생성
 */
export async function createBanPick(
  data: CreateBanPickDto
): Promise<BanPickResponse> {
  const response = await fetch('/api/ban-picks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
}

/**
 * 밴픽 수정
 */
export async function updateBanPick(
  id: string,
  data: Partial<CreateBanPickDto>
): Promise<BanPickResponse> {
  const response = await fetch(`/api/ban-picks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
}

/**
 * 밴픽 삭제
 */
export async function deleteBanPick(id: string): Promise<BanPickResponse> {
  const response = await fetch(`/api/ban-picks/${id}`, {
    method: 'DELETE',
  });
  return await response.json();
}

/**
 * 밴픽 일괄 생성 (게임 전체 밴픽 20개)
 */
export async function createBanPicks(
  banPicks: CreateBanPickDto[]
): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const promises = banPicks.map((banPick) => createBanPick(banPick));
    const responses = await Promise.all(promises);

    // 하나라도 실패하면 전체 실패로 간주
    const failed = responses.find((r) => !r.success);
    if (failed) {
      return { success: false, error: failed.error || '밴픽 저장 실패' };
    }

    return {
      success: true,
      data: responses.map((r) => r.data),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '밴픽 저장 실패',
    };
  }
}

/**
 * 게임별 밴픽 일괄 등록
 */
export async function addBanPicks(
  gameId: string,
  banPicks: Omit<CreateBanPickDto, 'game_id'>[]
): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const response = await fetch(`/api/games/${gameId}/ban-picks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(banPicks),
  });
  return response.json();
}

import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookie, verifyToken } from '@/features/admin/utils/auth';
import { calculateGameRatings } from '@/features/ratings/utils/ratingCalculator';
import { CalculateRatingsResponse } from '@/features/ratings/api/types';

// POST /api/ratings/calculate - 게임 완료 후 ELO 자동 계산 (관리자 전용)
export async function POST(request: NextRequest) {
  try {
    // 관리자 인증
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookie(cookieHeader);

    if (!token || !verifyToken(token)) {
      return NextResponse.json<CalculateRatingsResponse>(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { gameId } = body;

    if (!gameId) {
      return NextResponse.json<CalculateRatingsResponse>(
        { success: false, error: 'gameId는 필수입니다' },
        { status: 400 }
      );
    }

    // ELO 계산 실행
    const changes = await calculateGameRatings(gameId);

    return NextResponse.json<CalculateRatingsResponse>(
      { success: true, data: changes },
      { status: 200 }
    );
  } catch (error) {
    console.error('ELO 계산 오류:', error);
    return NextResponse.json<CalculateRatingsResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'ELO 계산 실패',
      },
      { status: 500 }
    );
  }
}

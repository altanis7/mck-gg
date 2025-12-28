import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken, getTokenFromCookie } from '@/features/admin/utils/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 인증
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookie(cookieHeader);
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { id: gameId } = await params;
    const banPicks = await request.json();

    // game_id 추가
    const banPicksWithGameId = banPicks.map((bp: any) => ({
      ...bp,
      game_id: gameId,
    }));

    const { data, error } = await supabaseAdmin
      .from('ban_picks')
      .insert(banPicksWithGameId)
      .select();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '밴픽 등록 실패',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken, getTokenFromCookie } from '@/features/admin/utils/auth';
import {
  MatchSeriesListResponse,
  MatchSeriesResponse,
} from '@/features/matches/api/types';

// GET: 시리즈 목록 조회 (games, game_results 포함)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('match_series')
      .select(`
        *,
        games(
          *,
          game_results(*),
          ban_picks(*)
        )
      `)
      .order('series_date', { ascending: false });

    if (error) {
      return NextResponse.json<MatchSeriesListResponse>(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json<MatchSeriesListResponse>({
      success: true,
      data: data as any, // 타입 단언 (MatchSeriesDetail[]로 반환됨)
    });
  } catch (error) {
    return NextResponse.json<MatchSeriesListResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : '시리즈 목록 조회 실패',
      },
      { status: 500 }
    );
  }
}

// POST: 시리즈 생성 (관리자 전용)
export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookie(cookieHeader);

    if (!token || !verifyToken(token)) {
      return NextResponse.json<MatchSeriesResponse>(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 필수 필드 검증
    if (!body.series_date || !body.series_type) {
      return NextResponse.json<MatchSeriesResponse>(
        { success: false, error: '필수 필드가 누락되었습니다' },
        { status: 400 }
      );
    }

    // series_type 검증
    if (!['bo1', 'bo3', 'bo5'].includes(body.series_type)) {
      return NextResponse.json<MatchSeriesResponse>(
        {
          success: false,
          error: 'series_type은 bo1, bo3, bo5 중 하나여야 합니다',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('match_series')
      .insert([
        {
          series_date: body.series_date,
          series_type: body.series_type,
          series_status: 'scheduled', // 초기 상태는 scheduled
          blue_wins: 0,
          red_wins: 0,
          team_a_wins: 0,
          team_b_wins: 0,
          notes: body.notes || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json<MatchSeriesResponse>(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json<MatchSeriesResponse>(
      { success: true, data },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json<MatchSeriesResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : '시리즈 생성 실패',
      },
      { status: 500 }
    );
  }
}

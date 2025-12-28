import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken, getTokenFromCookie } from '@/features/admin/utils/auth';
import {
  MatchSeriesDetailResponse,
  MatchSeriesResponse,
} from '@/features/matches/api/types';

// GET: 시리즈 상세 조회 (games, ban_picks, game_results 포함)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. 시리즈 정보 조회
    const { data: series, error: seriesError } = await supabaseAdmin
      .from('match_series')
      .select('*')
      .eq('id', id)
      .single();

    if (seriesError) {
      return NextResponse.json<MatchSeriesDetailResponse>(
        { success: false, error: seriesError.message },
        { status: 500 }
      );
    }

    if (!series) {
      return NextResponse.json<MatchSeriesDetailResponse>(
        { success: false, error: '시리즈를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 2. 해당 시리즈의 모든 게임 조회
    const { data: games, error: gamesError } = await supabaseAdmin
      .from('games')
      .select('*')
      .eq('match_series_id', id)
      .order('game_number', { ascending: true });

    if (gamesError) {
      return NextResponse.json<MatchSeriesDetailResponse>(
        { success: false, error: gamesError.message },
        { status: 500 }
      );
    }

    // 3. 각 게임별로 game_results와 ban_picks 조회
    const gamesWithDetails = await Promise.all(
      (games || []).map(async (game) => {
        // game_results 조회
        const { data: gameResults } = await supabaseAdmin
          .from('game_results')
          .select(`
            *,
            members!game_results_member_id_fkey(name, summoner_name)
          `)
          .eq('game_id', game.id)
          .order('team', { ascending: true })
          .order('position', { ascending: true });

        // ban_picks 조회
        const { data: banPicks } = await supabaseAdmin
          .from('ban_picks')
          .select('*')
          .eq('game_id', game.id)
          .order('order_number', { ascending: true });

        return {
          ...game,
          game_results: gameResults || [],
          ban_picks: banPicks || [],
        };
      })
    );

    const seriesDetail = {
      ...series,
      games: gamesWithDetails,
    };

    return NextResponse.json<MatchSeriesDetailResponse>({
      success: true,
      data: seriesDetail,
    });
  } catch (error) {
    return NextResponse.json<MatchSeriesDetailResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : '시리즈 조회 실패',
      },
      { status: 500 }
    );
  }
}

// PATCH: 시리즈 수정 (관리자 전용)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    // series_type 검증 (제공된 경우)
    if (
      body.series_type &&
      !['bo1', 'bo3', 'bo5'].includes(body.series_type)
    ) {
      return NextResponse.json<MatchSeriesResponse>(
        {
          success: false,
          error: 'series_type은 bo1, bo3, bo5 중 하나여야 합니다',
        },
        { status: 400 }
      );
    }

    // series_status 검증 (제공된 경우)
    if (
      body.series_status &&
      !['scheduled', 'ongoing', 'completed'].includes(body.series_status)
    ) {
      return NextResponse.json<MatchSeriesResponse>(
        {
          success: false,
          error:
            'series_status는 scheduled, ongoing, completed 중 하나여야 합니다',
        },
        { status: 400 }
      );
    }

    // winner_team 검증 (제공된 경우)
    if (body.winner_team && !['blue', 'red'].includes(body.winner_team)) {
      return NextResponse.json<MatchSeriesResponse>(
        {
          success: false,
          error: 'winner_team은 blue 또는 red여야 합니다',
        },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (body.series_date !== undefined) updateData.series_date = body.series_date;
    if (body.series_type !== undefined) updateData.series_type = body.series_type;
    if (body.series_status !== undefined)
      updateData.series_status = body.series_status;
    if (body.winner_team !== undefined) updateData.winner_team = body.winner_team;
    if (body.blue_wins !== undefined) updateData.blue_wins = body.blue_wins;
    if (body.red_wins !== undefined) updateData.red_wins = body.red_wins;
    if (body.screenshot_url !== undefined)
      updateData.screenshot_url = body.screenshot_url;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const { data, error } = await supabaseAdmin
      .from('match_series')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json<MatchSeriesResponse>(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json<MatchSeriesResponse>(
        { success: false, error: '시리즈를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json<MatchSeriesResponse>({ success: true, data });
  } catch (error) {
    return NextResponse.json<MatchSeriesResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : '시리즈 수정 실패',
      },
      { status: 500 }
    );
  }
}

// DELETE: 시리즈 삭제 (관리자 전용)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('match_series')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json<MatchSeriesResponse>(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json<MatchSeriesResponse>({ success: true });
  } catch (error) {
    return NextResponse.json<MatchSeriesResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : '시리즈 삭제 실패',
      },
      { status: 500 }
    );
  }
}

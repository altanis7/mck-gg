import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken, getTokenFromCookie } from '@/features/admin/utils/auth';

// GET: 경기 상세 조회 (개인 결과 포함)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: match, error: matchError } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('id', id)
      .single();

    if (matchError) {
      return NextResponse.json(
        { success: false, error: matchError.message },
        { status: 500 }
      );
    }

    if (!match) {
      return NextResponse.json(
        { success: false, error: '경기를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 해당 경기의 모든 개인 결과 조회
    const { data: gameResults, error: resultsError } = await supabaseAdmin
      .from('game_results')
      .select('*')
      .eq('match_id', id)
      .order('team', { ascending: true })
      .order('position', { ascending: true });

    if (resultsError) {
      return NextResponse.json(
        { success: false, error: resultsError.message },
        { status: 500 }
      );
    }

    const matchDetail = {
      ...match,
      game_results: gameResults || [],
    };

    return NextResponse.json({ success: true, data: matchDetail });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '경기 조회 실패',
      },
      { status: 500 }
    );
  }
}

// PATCH: 경기 수정 (관리자 전용)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 인증 확인
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookie(cookieHeader);

    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // winning_team 검증 (제공된 경우)
    if (body.winning_team && !['blue', 'red'].includes(body.winning_team)) {
      return NextResponse.json(
        { success: false, error: 'winning_team은 blue 또는 red여야 합니다' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (body.match_date !== undefined) updateData.match_date = body.match_date;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.winning_team !== undefined)
      updateData.winning_team = body.winning_team;
    if (body.screenshot_url !== undefined)
      updateData.screenshot_url = body.screenshot_url;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const { data, error } = await supabaseAdmin
      .from('matches')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: '경기를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '경기 수정 실패',
      },
      { status: 500 }
    );
  }
}

// DELETE: 경기 삭제 (관리자 전용)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 인증 확인
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookie(cookieHeader);

    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { error } = await supabaseAdmin.from('matches').delete().eq('id', id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '경기 삭제 실패',
      },
      { status: 500 }
    );
  }
}

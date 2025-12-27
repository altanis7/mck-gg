import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken, getTokenFromCookie } from '@/features/admin/utils/auth';

// GET: 경기 목록 조회
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('matches')
      .select('*')
      .order('match_date', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '경기 목록 조회 실패',
      },
      { status: 500 }
    );
  }
}

// POST: 경기 생성 (관리자 전용)
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // 필수 필드 검증
    if (!body.match_date || !body.duration || !body.winning_team) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다' },
        { status: 400 }
      );
    }

    // winning_team 검증
    if (!['blue', 'red'].includes(body.winning_team)) {
      return NextResponse.json(
        { success: false, error: 'winning_team은 blue 또는 red여야 합니다' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('matches')
      .insert([
        {
          match_date: body.match_date,
          duration: body.duration,
          winning_team: body.winning_team,
          screenshot_url: body.screenshot_url || null,
          notes: body.notes || null,
        },
      ])
      .select()
      .single();

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
        error: error instanceof Error ? error.message : '경기 생성 실패',
      },
      { status: 500 }
    );
  }
}

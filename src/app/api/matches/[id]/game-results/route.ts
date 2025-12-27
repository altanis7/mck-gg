import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken, getTokenFromCookie } from '@/features/admin/utils/auth';

// GET: 특정 경기의 모든 개인 결과 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('game_results')
      .select('*')
      .eq('match_id', id)
      .order('team', { ascending: true })
      .order('position', { ascending: true });

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
        error: error instanceof Error ? error.message : '경기 결과 조회 실패',
      },
      { status: 500 }
    );
  }
}

// POST: 개인 경기 결과 생성 (관리자 전용)
export async function POST(
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

    const { id: matchId } = await params;
    const body = await request.json();

    // 필수 필드 검증
    const requiredFields = [
      'member_id',
      'team',
      'position',
      'champion_name',
      'kills',
      'deaths',
      'assists',
      'cs',
      'champion_damage',
      'damage_taken',
      'gold_earned',
      'vision_score',
      'wards_placed',
      'wards_destroyed',
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return NextResponse.json(
          { success: false, error: `${field}는 필수 필드입니다` },
          { status: 400 }
        );
      }
    }

    // team 검증
    if (!['blue', 'red'].includes(body.team)) {
      return NextResponse.json(
        { success: false, error: 'team은 blue 또는 red여야 합니다' },
        { status: 400 }
      );
    }

    // position 검증
    if (
      !['top', 'jungle', 'mid', 'adc', 'support'].includes(body.position)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'position은 top, jungle, mid, adc, support 중 하나여야 합니다',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('game_results')
      .insert([
        {
          match_id: matchId,
          member_id: body.member_id,
          team: body.team,
          position: body.position,
          champion_name: body.champion_name,
          kills: body.kills,
          deaths: body.deaths,
          assists: body.assists,
          max_kill_streak: body.max_kill_streak || 0,
          max_multikill: body.max_multikill || 0,
          first_blood: body.first_blood || false,
          cs: body.cs,
          neutral_monsters_killed: body.neutral_monsters_killed || 0,
          champion_damage: body.champion_damage,
          turret_damage: body.turret_damage || 0,
          objective_damage: body.objective_damage || 0,
          damage_taken: body.damage_taken,
          healing: body.healing || 0,
          damage_reduction: body.damage_reduction || 0,
          cc_score: body.cc_score || 0,
          gold_earned: body.gold_earned,
          gold_spent: body.gold_spent || 0,
          vision_score: body.vision_score,
          wards_placed: body.wards_placed,
          wards_destroyed: body.wards_destroyed,
          control_wards_purchased: body.control_wards_purchased || 0,
          turret_kills: body.turret_kills || 0,
          inhibitor_kills: body.inhibitor_kills || 0,
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
        error: error instanceof Error ? error.message : '경기 결과 생성 실패',
      },
      { status: 500 }
    );
  }
}

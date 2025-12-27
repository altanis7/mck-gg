import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken, getTokenFromCookie } from '@/features/admin/utils/auth';

// PATCH: 개인 경기 결과 수정 (관리자 전용)
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

    // team 검증 (제공된 경우)
    if (body.team && !['blue', 'red'].includes(body.team)) {
      return NextResponse.json(
        { success: false, error: 'team은 blue 또는 red여야 합니다' },
        { status: 400 }
      );
    }

    // position 검증 (제공된 경우)
    if (
      body.position &&
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

    const updateData: any = {};
    if (body.team !== undefined) updateData.team = body.team;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.champion_name !== undefined)
      updateData.champion_name = body.champion_name;
    if (body.kills !== undefined) updateData.kills = body.kills;
    if (body.deaths !== undefined) updateData.deaths = body.deaths;
    if (body.assists !== undefined) updateData.assists = body.assists;
    if (body.max_kill_streak !== undefined)
      updateData.max_kill_streak = body.max_kill_streak;
    if (body.max_multikill !== undefined)
      updateData.max_multikill = body.max_multikill;
    if (body.first_blood !== undefined) updateData.first_blood = body.first_blood;
    if (body.cs !== undefined) updateData.cs = body.cs;
    if (body.neutral_monsters_killed !== undefined)
      updateData.neutral_monsters_killed = body.neutral_monsters_killed;
    if (body.champion_damage !== undefined)
      updateData.champion_damage = body.champion_damage;
    if (body.turret_damage !== undefined)
      updateData.turret_damage = body.turret_damage;
    if (body.objective_damage !== undefined)
      updateData.objective_damage = body.objective_damage;
    if (body.damage_taken !== undefined)
      updateData.damage_taken = body.damage_taken;
    if (body.healing !== undefined) updateData.healing = body.healing;
    if (body.damage_reduction !== undefined)
      updateData.damage_reduction = body.damage_reduction;
    if (body.cc_score !== undefined) updateData.cc_score = body.cc_score;
    if (body.gold_earned !== undefined) updateData.gold_earned = body.gold_earned;
    if (body.gold_spent !== undefined) updateData.gold_spent = body.gold_spent;
    if (body.vision_score !== undefined)
      updateData.vision_score = body.vision_score;
    if (body.wards_placed !== undefined)
      updateData.wards_placed = body.wards_placed;
    if (body.wards_destroyed !== undefined)
      updateData.wards_destroyed = body.wards_destroyed;
    if (body.control_wards_purchased !== undefined)
      updateData.control_wards_purchased = body.control_wards_purchased;
    if (body.turret_kills !== undefined)
      updateData.turret_kills = body.turret_kills;
    if (body.inhibitor_kills !== undefined)
      updateData.inhibitor_kills = body.inhibitor_kills;

    const { data, error } = await supabaseAdmin
      .from('game_results')
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
        { success: false, error: '경기 결과를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '경기 결과 수정 실패',
      },
      { status: 500 }
    );
  }
}

// DELETE: 개인 경기 결과 삭제 (관리자 전용)
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

    const { error } = await supabaseAdmin
      .from('game_results')
      .delete()
      .eq('id', id);

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
        error: error instanceof Error ? error.message : '경기 결과 삭제 실패',
      },
      { status: 500 }
    );
  }
}

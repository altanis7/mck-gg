import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken, getTokenFromCookie } from '@/features/admin/utils/auth';
import { validateCreateMember } from '@/features/members/utils/validators';
import {
  Member,
  CreateMemberDto,
  MembersResponse,
  MemberResponse,
} from '@/features/members/api/types';

// GET: 멤버 목록 조회
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json<MembersResponse>(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json<MembersResponse>({
      success: true,
      data: data as Member[],
    });
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json<MembersResponse>(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 멤버 생성
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookie(cookieHeader);

    if (!token || !verifyToken(token)) {
      return NextResponse.json<MemberResponse>(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body: CreateMemberDto = await request.json();

    // 검증
    const validation = validateCreateMember(body);
    if (!validation.valid) {
      return NextResponse.json<MemberResponse>(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // 생성
    const { data, error } = await supabase
      .from('members')
      .insert([
        {
          name: body.name,
          summoner_name: body.summoner_name,
          riot_id: body.riot_id,
          solo_tier: body.solo_tier,
          solo_rank: body.solo_rank,
          main_position: body.main_position,
          sub_position: body.sub_position,
          is_guest: body.is_guest ?? false,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // UNIQUE constraint violation
        return NextResponse.json<MemberResponse>(
          { success: false, error: '이미 존재하는 소환사명입니다.' },
          { status: 400 }
        );
      }

      return NextResponse.json<MemberResponse>(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json<MemberResponse>(
      { success: true, data: data as Member },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create member error:', error);
    return NextResponse.json<MemberResponse>(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

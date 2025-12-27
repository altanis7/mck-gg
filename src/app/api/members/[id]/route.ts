import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken, getTokenFromCookie } from '@/features/admin/utils/auth';
import { validateUpdateMember } from '@/features/members/utils/validators';
import {
  Member,
  UpdateMemberDto,
  MemberResponse,
  DeleteMemberResponse,
} from '@/features/members/api/types';

// GET: 멤버 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json<MemberResponse>(
          { success: false, error: '멤버를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      return NextResponse.json<MemberResponse>(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json<MemberResponse>({
      success: true,
      data: data as Member,
    });
  } catch (error) {
    console.error('Get member error:', error);
    return NextResponse.json<MemberResponse>(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PATCH: 멤버 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body: UpdateMemberDto = await request.json();

    // 검증
    const validation = validateUpdateMember(body);
    if (!validation.valid) {
      return NextResponse.json<MemberResponse>(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // 수정
    const { data, error } = await supabase
      .from('members')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json<MemberResponse>(
          { success: false, error: '멤버를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      if (error.code === '23505') {
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

    return NextResponse.json<MemberResponse>({
      success: true,
      data: data as Member,
    });
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json<MemberResponse>(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 멤버 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookie(cookieHeader);

    if (!token || !verifyToken(token)) {
      return NextResponse.json<DeleteMemberResponse>(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { error } = await supabase.from('members').delete().eq('id', id);

    if (error) {
      return NextResponse.json<DeleteMemberResponse>(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json<DeleteMemberResponse>({ success: true });
  } catch (error) {
    console.error('Delete member error:', error);
    return NextResponse.json<DeleteMemberResponse>(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

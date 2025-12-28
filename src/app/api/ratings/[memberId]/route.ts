import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { RatingHistoryResponse, MemberRating } from '@/features/ratings/api/types';

// GET /api/ratings/[memberId] - 개인 ELO 히스토리 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const memberId = params.memberId;

    if (!memberId) {
      return NextResponse.json<RatingHistoryResponse>(
        { success: false, error: 'memberId는 필수입니다' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('member_ratings')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json<RatingHistoryResponse>(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const history = (data || []) as MemberRating[];

    return NextResponse.json<RatingHistoryResponse>({
      success: true,
      data: history,
    });
  } catch (error) {
    return NextResponse.json<RatingHistoryResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'ELO 히스토리 조회 실패',
      },
      { status: 500 }
    );
  }
}

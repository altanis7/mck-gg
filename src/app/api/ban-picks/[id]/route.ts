import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getTokenFromCookie, verifyToken } from "@/features/admin/utils/auth";
import { BanPickResponse } from "@/features/matches/api/types";

// PATCH /api/ban-picks/[id] - 밴픽 수정 (관리자 전용)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = getTokenFromCookie(cookieHeader);

    if (!token || !verifyToken(token)) {
      return NextResponse.json<BanPickResponse>(
        { success: false, error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // team 검증 (제공된 경우)
    if (body.team && !["blue", "red"].includes(body.team)) {
      return NextResponse.json<BanPickResponse>(
        { success: false, error: "team은 blue 또는 red여야 합니다" },
        { status: 400 }
      );
    }

    // phase 검증 (제공된 경우)
    if (body.phase && !["ban", "pick"].includes(body.phase)) {
      return NextResponse.json<BanPickResponse>(
        { success: false, error: "phase는 ban 또는 pick이어야 합니다" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("ban_picks")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json<BanPickResponse>(
        { success: false, error: error?.message || "밴픽 수정 실패" },
        { status: 500 }
      );
    }

    return NextResponse.json<BanPickResponse>({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json<BanPickResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "밴픽 수정 실패",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/ban-picks/[id] - 밴픽 삭제 (관리자 전용)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = getTokenFromCookie(cookieHeader);

    if (!token || !verifyToken(token)) {
      return NextResponse.json<BanPickResponse>(
        { success: false, error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("ban_picks")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json<BanPickResponse>(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json<BanPickResponse>({
      success: true,
    });
  } catch (error) {
    return NextResponse.json<BanPickResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "밴픽 삭제 실패",
      },
      { status: 500 }
    );
  }
}

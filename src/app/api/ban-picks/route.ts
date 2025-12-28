import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getTokenFromCookie, verifyToken } from "@/features/admin/utils/auth";
import { BanPickResponse } from "@/features/matches/api/types";

// POST /api/ban-picks - 밴픽 생성 (관리자 전용)
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = getTokenFromCookie(cookieHeader);

    if (!token || !verifyToken(token)) {
      return NextResponse.json<BanPickResponse>(
        { success: false, error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      game_id,
      team,
      phase,
      order_number,
      champion_name,
      position,
      selected_by_member_id,
    } = body;

    // 필수 필드 검증
    if (!game_id || !team || !phase || !order_number || !champion_name) {
      return NextResponse.json<BanPickResponse>(
        {
          success: false,
          error:
            "game_id, team, phase, order_number, champion_name은 필수입니다",
        },
        { status: 400 }
      );
    }

    // team 검증
    if (!["blue", "red"].includes(team)) {
      return NextResponse.json<BanPickResponse>(
        { success: false, error: "team은 blue 또는 red여야 합니다" },
        { status: 400 }
      );
    }

    // phase 검증
    if (!["ban", "pick"].includes(phase)) {
      return NextResponse.json<BanPickResponse>(
        { success: false, error: "phase는 ban 또는 pick이어야 합니다" },
        { status: 400 }
      );
    }

    // pick인 경우 position과 selected_by_member_id 필수
    if (phase === "pick" && (!position || !selected_by_member_id)) {
      return NextResponse.json<BanPickResponse>(
        {
          success: false,
          error: "pick인 경우 position과 selected_by_member_id는 필수입니다",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("ban_picks")
      .insert([
        {
          game_id,
          team,
          phase,
          order_number,
          champion_name,
          position: position || null,
          selected_by_member_id: selected_by_member_id || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json<BanPickResponse>(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json<BanPickResponse>(
      { success: true, data },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json<BanPickResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "밴픽 생성 실패",
      },
      { status: 500 }
    );
  }
}

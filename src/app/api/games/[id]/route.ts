import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getTokenFromCookie, verifyToken } from "@/features/admin/utils/auth";
import { GameResponse, GameDetailResponse } from "@/features/matches/api/types";

// GET /api/games/[id] - 게임 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. 게임 정보 조회
    const { data: game, error: gameError } = await supabaseAdmin
      .from("games")
      .select("*")
      .eq("id", id)
      .single();

    if (gameError || !game) {
      return NextResponse.json<GameResponse>(
        { success: false, error: "게임을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 2. 게임 결과 조회
    const { data: gameResults } = await supabaseAdmin
      .from("game_results")
      .select(`
        *,
        members!game_results_member_id_fkey(name, summoner_name)
      `)
      .eq("game_id", id)
      .order("team", { ascending: true })
      .order("position", { ascending: true });

    // 3. 밴픽 조회
    const { data: banPicks } = await supabaseAdmin
      .from("ban_picks")
      .select("*")
      .eq("game_id", id)
      .order("order_number", { ascending: true });

    const gameDetail = {
      ...game,
      game_results: gameResults || [],
      ban_picks: banPicks || [],
    };

    return NextResponse.json<GameDetailResponse>({
      success: true,
      data: gameDetail,
    });
  } catch (error) {
    return NextResponse.json<GameResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "게임 조회 실패",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/games/[id] - 게임 수정 (관리자 전용)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = getTokenFromCookie(cookieHeader);

    if (!token || !verifyToken(token)) {
      return NextResponse.json<GameResponse>(
        { success: false, error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const { data: game, error } = await supabaseAdmin
      .from("games")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !game) {
      return NextResponse.json<GameResponse>(
        { success: false, error: error?.message || "게임 수정 실패" },
        { status: 500 }
      );
    }

    // 게임 상태가 completed로 변경되었다면 시리즈 상태 업데이트
    if (body.game_status === "completed" && game.match_series_id) {
      await updateSeriesStatus(game.match_series_id);
    }

    return NextResponse.json<GameResponse>({
      success: true,
      data: game,
    });
  } catch (error) {
    return NextResponse.json<GameResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "게임 수정 실패",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/games/[id] - 게임 삭제 (관리자 전용)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = getTokenFromCookie(cookieHeader);

    if (!token || !verifyToken(token)) {
      return NextResponse.json<GameResponse>(
        { success: false, error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 1. 게임 정보 조회 (시리즈 ID, 게임 번호 확인용)
    const { data: game } = await supabaseAdmin
      .from("games")
      .select("match_series_id, game_number")
      .eq("id", id)
      .single();

    if (!game) {
      return NextResponse.json<GameResponse>(
        { success: false, error: "게임을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 2. 게임 삭제 (CASCADE로 game_results, ban_picks도 자동 삭제됨)
    const { error } = await supabaseAdmin.from("games").delete().eq("id", id);

    if (error) {
      return NextResponse.json<GameResponse>(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // 3. 삭제된 게임 번호보다 큰 게임들의 번호를 1씩 감소
    if (supabaseAdmin) {
      const { data: laterGames } = await supabaseAdmin
        .from("games")
        .select("id, game_number")
        .eq("match_series_id", game.match_series_id)
        .gt("game_number", game.game_number);

      if (laterGames && laterGames.length > 0) {
        for (const laterGame of laterGames) {
          await supabaseAdmin
            .from("games")
            .update({ game_number: laterGame.game_number - 1 })
            .eq("id", laterGame.id);
        }
      }
    }

    // 4. 시리즈 상태 업데이트
    if (game.match_series_id) {
      await updateSeriesStatus(game.match_series_id);
    }

    return NextResponse.json<GameResponse>({
      success: true,
    });
  } catch (error) {
    return NextResponse.json<GameResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "게임 삭제 실패",
      },
      { status: 500 }
    );
  }
}

// 헬퍼 함수: 시리즈 상태 업데이트
async function updateSeriesStatus(seriesId: string) {
  try {
    // 해당 시리즈의 모든 완료된 게임 조회
    const { data: games } = await supabaseAdmin
      .from("games")
      .select("winning_team")
      .eq("match_series_id", seriesId)
      .eq("game_status", "completed");

    if (!games || games.length === 0) {
      // 게임이 없으면 통계 초기화 (상태는 수동 관리)
      await supabaseAdmin
        .from("match_series")
        .update({
          blue_wins: 0,
          red_wins: 0,
        })
        .eq("id", seriesId);
      return;
    }

    // 팀별 승수 계산 (통계 목적만)
    const blueWins = games.filter((g) => g.winning_team === "blue").length;
    const redWins = games.filter((g) => g.winning_team === "red").length;

    // 시리즈 통계만 업데이트 (상태는 수동 관리)
    await supabaseAdmin
      .from("match_series")
      .update({
        blue_wins: blueWins,
        red_wins: redWins,
      })
      .eq("id", seriesId);
  } catch (error) {
    console.error("시리즈 상태 업데이트 실패:", error);
  }
}

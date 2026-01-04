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

// 헬퍼 함수: 시리즈 상태 업데이트 (팀 A/B 기반)
async function updateSeriesStatus(seriesId: string) {
  try {
    // 1. 해당 시리즈의 모든 게임 조회 (게임 번호 순)
    const { data: games } = await supabaseAdmin
      .from("games")
      .select("id, game_number, winning_team, game_status")
      .eq("match_series_id", seriesId)
      .order("game_number", { ascending: true });

    if (!games || games.length === 0) {
      // 게임이 없으면 통계 초기화
      await supabaseAdmin
        .from("match_series")
        .update({
          blue_wins: 0,
          red_wins: 0,
          team_a_wins: 0,
          team_b_wins: 0,
        })
        .eq("id", seriesId);
      return;
    }

    // 2. 첫 번째 게임에서 블루팀 멤버 목록 가져오기 (= team_a)
    const firstGame = games[0];
    const { data: firstGameResults } = await supabaseAdmin
      .from("game_results")
      .select("member_id, team")
      .eq("game_id", firstGame.id);

    const teamAMembers = new Set<string>();
    if (firstGameResults) {
      firstGameResults
        .filter((r) => r.team === "blue")
        .forEach((r) => teamAMembers.add(r.member_id));
    }

    // 3. 각 완료된 게임별로 승리 팀 계산
    let blueWins = 0;
    let redWins = 0;
    let teamAWins = 0;
    let teamBWins = 0;

    for (const game of games) {
      if (game.game_status !== "completed" || !game.winning_team) continue;

      // 기존 blue/red 통계 (하위 호환성)
      if (game.winning_team === "blue") blueWins++;
      else if (game.winning_team === "red") redWins++;

      // 팀 A/B 승리 계산: 해당 게임에서 승리 진영에 team_a 멤버가 있는지 확인
      const { data: gameResults } = await supabaseAdmin
        .from("game_results")
        .select("member_id, team")
        .eq("game_id", game.id);

      if (gameResults && gameResults.length > 0) {
        // 승리 진영의 멤버들
        const winningTeamMembers = gameResults
          .filter((r) => r.team === game.winning_team)
          .map((r) => r.member_id);

        // 승리 진영에 team_a 멤버가 있으면 team_a 승리
        const teamAWon = winningTeamMembers.some((m) => teamAMembers.has(m));
        if (teamAWon) {
          teamAWins++;
        } else {
          teamBWins++;
        }
      }
    }

    // 4. 시리즈 통계 업데이트
    await supabaseAdmin
      .from("match_series")
      .update({
        blue_wins: blueWins,
        red_wins: redWins,
        team_a_wins: teamAWins,
        team_b_wins: teamBWins,
      })
      .eq("id", seriesId);
  } catch (error) {
    console.error("시리즈 상태 업데이트 실패:", error);
  }
}

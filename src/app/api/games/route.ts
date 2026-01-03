import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getTokenFromCookie, verifyToken } from "@/features/admin/utils/auth";
import { GameResponse, GameListResponse } from "@/features/matches/api/types";

// POST /api/games - 게임 생성 (관리자 전용)
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = getTokenFromCookie(cookieHeader);

    if (!token || !verifyToken(token)) {
      return NextResponse.json<GameResponse>(
        { success: false, error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { match_series_id, game_number, duration, winning_team, notes } =
      body;

    // 필수 필드 검증
    if (!match_series_id || !game_number) {
      return NextResponse.json<GameResponse>(
        {
          success: false,
          error: "match_series_id와 game_number는 필수입니다",
        },
        { status: 400 }
      );
    }

    // 게임 생성
    const { data: game, error: gameError } = await supabaseAdmin
      .from("games")
      .insert([
        {
          match_series_id,
          game_number,
          game_status: duration && winning_team ? "completed" : "not_started",
          winning_team: winning_team || null,
          duration: duration || null,
          notes: notes || null,
        },
      ])
      .select()
      .single();

    if (gameError || !game) {
      return NextResponse.json<GameResponse>(
        { success: false, error: gameError?.message || "게임 생성 실패" },
        { status: 500 }
      );
    }

    // 시리즈 상태 업데이트
    if (duration && winning_team) {
      await updateSeriesStatus(match_series_id);
    }

    return NextResponse.json<GameResponse>(
      { success: true, data: game },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json<GameResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "게임 생성 실패",
      },
      { status: 500 }
    );
  }
}

// GET /api/games - 게임 목록 조회 (특정 시리즈의 게임들)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const match_series_id = searchParams.get("match_series_id");

    if (!match_series_id) {
      return NextResponse.json<GameListResponse>(
        { success: false, error: "match_series_id는 필수입니다" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("games")
      .select("*")
      .eq("match_series_id", match_series_id)
      .order("game_number", { ascending: true });

    if (error) {
      return NextResponse.json<GameListResponse>(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json<GameListResponse>({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json<GameListResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "게임 목록 조회 실패",
      },
      { status: 500 }
    );
  }
}

// 헬퍼 함수: 멤버의 시리즈 연승/연패 업데이트
async function updateMemberSeriesStreaks(
  seriesId: string,
  winnerTeam: "blue" | "red"
) {
  try {
    // 1. 시리즈의 첫 번째 게임에서 참가자 10명 조회
    const { data: firstGame } = await supabaseAdmin
      .from("games")
      .select("id")
      .eq("match_series_id", seriesId)
      .eq("game_number", 1)
      .single();

    if (!firstGame) {
      console.error("첫 번째 게임을 찾을 수 없습니다:", seriesId);
      return;
    }

    const { data: participants } = await supabaseAdmin
      .from("game_results")
      .select("member_id, team")
      .eq("game_id", firstGame.id);

    if (!participants || participants.length === 0) {
      console.error("참가자를 찾을 수 없습니다:", firstGame.id);
      return;
    }

    // 2. 각 멤버의 팀 확인
    const memberTeams = new Map<string, "blue" | "red">();
    participants.forEach((p) => {
      memberTeams.set(p.member_id, p.team);
    });

    // 3. 각 멤버의 시리즈 연승/연패 업데이트
    for (const [memberId, team] of memberTeams) {
      const won = team === winnerTeam;

      // 현재 연승/연패 조회
      const { data: member } = await supabaseAdmin
        .from("members")
        .select("current_series_streak")
        .eq("id", memberId)
        .single();

      if (!member) {
        console.error("멤버를 찾을 수 없습니다:", memberId);
        continue;
      }

      const currentStreak = member.current_series_streak || 0;

      // 새 연승/연패 계산 (game streak과 동일한 로직)
      let newStreak: number;
      if (won) {
        newStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
      } else {
        newStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
      }

      // 멤버 업데이트
      await supabaseAdmin
        .from("members")
        .update({ current_series_streak: newStreak })
        .eq("id", memberId);

      // 참가 이력 기록
      await supabaseAdmin.from("member_series_participation").upsert({
        member_id: memberId,
        match_series_id: seriesId,
        won,
        team,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("시리즈 연승/연패 업데이트 실패:", error);
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
      return;
    }

    // 팀별 승수 계산
    const blueWins = games.filter((g) => g.winning_team === "blue").length;
    const redWins = games.filter((g) => g.winning_team === "red").length;

    // 시리즈 정보 조회
    const { data: series } = await supabaseAdmin
      .from("match_series")
      .select("series_type")
      .eq("id", seriesId)
      .single();

    if (!series) return;

    // 승리 조건 확인
    const winsNeeded =
      series.series_type === "bo3" ? 2 : series.series_type === "bo5" ? 3 : 1;

    let seriesStatus: "scheduled" | "ongoing" | "completed" = "ongoing";
    let winnerTeam: "blue" | "red" | null = null;

    if (blueWins >= winsNeeded) {
      seriesStatus = "completed";
      winnerTeam = "blue";
    } else if (redWins >= winsNeeded) {
      seriesStatus = "completed";
      winnerTeam = "red";
    }

    // 시리즈 업데이트
    await supabaseAdmin
      .from("match_series")
      .update({
        blue_wins: blueWins,
        red_wins: redWins,
        series_status: seriesStatus,
        winner_team: winnerTeam,
      })
      .eq("id", seriesId);

    // 시리즈 완료 시 모든 참가자의 연승/연패 업데이트
    if (seriesStatus === "completed" && winnerTeam) {
      await updateMemberSeriesStreaks(seriesId, winnerTeam);
    }
  } catch (error) {
    console.error("시리즈 상태 업데이트 실패:", error);
  }
}

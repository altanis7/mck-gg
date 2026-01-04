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

// 헬퍼 함수: 멤버의 시리즈 연승/연패 업데이트 (팀 A/B 기반)
async function updateMemberSeriesStreaks(
  seriesId: string,
  winnerTeam: "team_a" | "team_b"
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

    // 2. 각 멤버가 team_a (첫 게임 블루팀) 인지 확인
    const teamAMembers = new Set<string>();
    participants
      .filter((p) => p.team === "blue")
      .forEach((p) => teamAMembers.add(p.member_id));

    // 3. 각 멤버의 시리즈 연승/연패 업데이트
    for (const participant of participants) {
      const memberId = participant.member_id;
      const isTeamA = teamAMembers.has(memberId);
      const won = (isTeamA && winnerTeam === "team_a") || (!isTeamA && winnerTeam === "team_b");

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

      // 참가 이력 기록 (team_a/team_b 정보 저장)
      await supabaseAdmin.from("member_series_participation").upsert({
        member_id: memberId,
        match_series_id: seriesId,
        won,
        team: isTeamA ? "team_a" : "team_b",
        updated_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("시리즈 연승/연패 업데이트 실패:", error);
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

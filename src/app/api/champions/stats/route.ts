import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ChampionStatsResponse, ChampionWinRateStats, ChampionBanStats } from '@/features/champion-rankings/api/types';

// GET /api/champions/stats - 챔피언별 통계 조회
export async function GET() {
  try {
    // 1. 승률 통계: game_results + games 조인
    const { data: gameResultsData, error: gameResultsError } = await supabaseAdmin
      .from('game_results')
      .select(`
        champion_name,
        team,
        games!inner (
          winning_team
        )
      `);

    if (gameResultsError) {
      return NextResponse.json<ChampionStatsResponse>(
        { success: false, error: gameResultsError.message },
        { status: 500 }
      );
    }

    // 챔피언별 승/패 집계
    const championWinLossMap = new Map<string, { wins: number; losses: number }>();

    (gameResultsData || []).forEach((result: any) => {
      const championName = result.champion_name;
      const isWin = result.team === result.games.winning_team;

      if (!championWinLossMap.has(championName)) {
        championWinLossMap.set(championName, { wins: 0, losses: 0 });
      }

      const stats = championWinLossMap.get(championName)!;
      if (isWin) {
        stats.wins++;
      } else {
        stats.losses++;
      }
    });

    // 승률 통계 배열 생성 (승률 내림차순 정렬)
    const winRateStats: ChampionWinRateStats[] = Array.from(championWinLossMap.entries())
      .map(([championName, stats]) => {
        const picks = stats.wins + stats.losses;
        const winRate = picks > 0 ? (stats.wins / picks) * 100 : 0;
        return {
          championName,
          picks,
          wins: stats.wins,
          losses: stats.losses,
          winRate: Math.round(winRate * 10) / 10,
          totalGames: picks,
        };
      })
      .sort((a, b) => b.winRate - a.winRate || b.picks - a.picks);

    // 2. 밴률 통계: ban_picks 테이블에서 phase='ban' 조건
    const { data: banData, error: banError } = await supabaseAdmin
      .from('ban_picks')
      .select('champion_name, game_id')
      .eq('phase', 'ban');

    if (banError) {
      return NextResponse.json<ChampionStatsResponse>(
        { success: false, error: banError.message },
        { status: 500 }
      );
    }

    // 총 게임 수 조회
    const { count: totalGamesCount, error: countError } = await supabaseAdmin
      .from('games')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return NextResponse.json<ChampionStatsResponse>(
        { success: false, error: countError.message },
        { status: 500 }
      );
    }

    const totalGames = totalGamesCount || 0;

    // 챔피언별 밴 횟수 집계
    const championBanMap = new Map<string, number>();

    (banData || []).forEach((ban: any) => {
      const championName = ban.champion_name;
      championBanMap.set(championName, (championBanMap.get(championName) || 0) + 1);
    });

    // 밴률 통계 배열 생성 (밴률 내림차순 정렬)
    const banRateStats: ChampionBanStats[] = Array.from(championBanMap.entries())
      .map(([championName, bans]) => {
        const banRate = totalGames > 0 ? (bans / totalGames) * 100 : 0;
        return {
          championName,
          bans,
          totalGames,
          banRate: Math.round(banRate * 10) / 10,
        };
      })
      .sort((a, b) => b.banRate - a.banRate || b.bans - a.bans);

    return NextResponse.json<ChampionStatsResponse>({
      success: true,
      data: {
        winRateStats,
        banRateStats,
      },
    });
  } catch (error) {
    return NextResponse.json<ChampionStatsResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : '챔피언 통계 조회 실패',
      },
      { status: 500 }
    );
  }
}


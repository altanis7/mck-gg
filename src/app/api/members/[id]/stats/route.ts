import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  MemberStatsResponse,
  PlayerChampionStats,
  PlayerPositionStats,
  PlayerOverallStats,
  PlayerMatchDetail,
} from '@/features/members/api/types';
import { getTierByPercentile } from '@/features/ratings/utils/tierSystem';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. 멤버 기본 정보 조회
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        {
          success: false,
          error: '멤버를 찾을 수 없습니다',
        } as MemberStatsResponse,
        { status: 404 }
      );
    }

    // 2. 게임 결과 데이터 조회 (전체 통계용)
    const { data: gameResults, error: gameResultsError } = await supabase
      .from('game_results')
      .select(
        `
        *,
        games (
          id,
          winning_team,
          duration,
          game_number,
          match_series (
            series_date,
            id
          )
        )
      `
      )
      .eq('member_id', id);

    if (gameResultsError) {
      console.error('Game results error:', gameResultsError);
      return NextResponse.json(
        {
          success: false,
          error: '게임 결과를 가져오는데 실패했습니다',
        } as MemberStatsResponse,
        { status: 500 }
      );
    }

    // 게임 결과가 없는 경우 빈 통계 반환
    if (!gameResults || gameResults.length === 0) {
      // 티어 정보 계산
      const { data: rankingData } = await supabase
        .from('member_rankings')
        .select('ranking')
        .eq('id', id)
        .single();

      const { count: totalPlayers } = await supabase
        .from('member_rankings')
        .select('*', { count: 'exact', head: true });

      const ranking = rankingData?.ranking || 1;
      const total = totalPlayers || 1;
      const tierConfig = getTierByPercentile(ranking, total);

      return NextResponse.json({
        success: true,
        data: {
          member,
          stats: {
            totalGames: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            currentElo: 1000,
            peakElo: 1000,
            currentStreak: 0,
            avgKda: 0,
            avgKills: 0,
            avgDeaths: 0,
            avgAssists: 0,
            avgCs: 0,
            avgDamage: 0,
          },
          topChampions: [],
          positionStats: [],
          recentMatches: [],
          eloHistory: [],
          tierConfig,
        },
      } as MemberStatsResponse);
    }

    // 3. 전체 통계 계산
    const totalGames = gameResults.length;
    const wins = gameResults.filter((gr) => {
      const game = gr.games as any;
      return (
        (gr.team === 'blue' && game.winning_team === 'blue') ||
        (gr.team === 'red' && game.winning_team === 'red')
      );
    }).length;

    const totalKills = gameResults.reduce((sum, gr) => sum + (gr.kills || 0), 0);
    const totalDeaths = gameResults.reduce((sum, gr) => sum + (gr.deaths || 0), 0);
    const totalAssists = gameResults.reduce((sum, gr) => sum + (gr.assists || 0), 0);
    const totalCs = gameResults.reduce((sum, gr) => sum + (gr.cs || 0), 0);
    const totalDamage = gameResults.reduce((sum, gr) => sum + (gr.champion_damage || 0), 0);

    const avgKda =
      totalDeaths === 0
        ? totalKills + totalAssists
        : (totalKills + totalAssists) / totalDeaths;

    const stats: PlayerOverallStats = {
      totalGames,
      wins,
      losses: totalGames - wins,
      winRate: totalGames > 0 ? (wins / totalGames) * 100 : 0,
      currentElo: 1000, // 나중에 member_rating에서 가져올 예정
      peakElo: 1000,
      currentStreak: 0,
      avgKda,
      avgKills: totalGames > 0 ? totalKills / totalGames : 0,
      avgDeaths: totalGames > 0 ? totalDeaths / totalGames : 0,
      avgAssists: totalGames > 0 ? totalAssists / totalGames : 0,
      avgCs: totalGames > 0 ? totalCs / totalGames : 0,
      avgDamage: totalGames > 0 ? totalDamage / totalGames : 0,
    };

    // 4. 챔피언별 통계 계산 (상위 10개)
    const championMap = new Map<string, any>();

    gameResults.forEach((gr) => {
      const champName = gr.champion_name;
      const game = gr.games as any;
      const won =
        (gr.team === 'blue' && game.winning_team === 'blue') ||
        (gr.team === 'red' && game.winning_team === 'red');

      if (!championMap.has(champName)) {
        championMap.set(champName, {
          championName: champName,
          games: 0,
          wins: 0,
          losses: 0,
          totalKills: 0,
          totalDeaths: 0,
          totalAssists: 0,
          totalCs: 0,
          totalDamage: 0,
        });
      }

      const champ = championMap.get(champName);
      champ.games += 1;
      if (won) champ.wins += 1;
      else champ.losses += 1;
      champ.totalKills += gr.kills || 0;
      champ.totalDeaths += gr.deaths || 0;
      champ.totalAssists += gr.assists || 0;
      champ.totalCs += gr.cs || 0;
      champ.totalDamage += gr.champion_damage || 0;
    });

    const topChampions: PlayerChampionStats[] = Array.from(championMap.values())
      .map((champ) => ({
        championName: champ.championName,
        games: champ.games,
        wins: champ.wins,
        losses: champ.losses,
        winRate: (champ.wins / champ.games) * 100,
        avgKda:
          champ.totalDeaths === 0
            ? champ.totalKills + champ.totalAssists
            : (champ.totalKills + champ.totalAssists) / champ.totalDeaths,
        avgKills: champ.totalKills / champ.games,
        avgDeaths: champ.totalDeaths / champ.games,
        avgAssists: champ.totalAssists / champ.games,
        avgCs: champ.totalCs / champ.games,
        avgDamage: champ.totalDamage / champ.games,
      }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 10);

    // 5. 포지션별 통계 계산
    const positionMap = new Map<string, any>();

    gameResults.forEach((gr) => {
      const pos = gr.position;
      const game = gr.games as any;
      const won =
        (gr.team === 'blue' && game.winning_team === 'blue') ||
        (gr.team === 'red' && game.winning_team === 'red');

      if (!positionMap.has(pos)) {
        positionMap.set(pos, {
          position: pos,
          games: 0,
          wins: 0,
        });
      }

      const posData = positionMap.get(pos);
      posData.games += 1;
      if (won) posData.wins += 1;
    });

    const positionStats: PlayerPositionStats[] = Array.from(positionMap.values())
      .map((pos) => ({
        position: pos.position,
        games: pos.games,
        wins: pos.wins,
        winRate: (pos.wins / pos.games) * 100,
      }))
      .sort((a, b) => b.games - a.games);

    // 6. 최근 경기 15개 조회 (상세 정보 포함)
    const { data: recentGamesData, error: recentGamesError } = await supabase
      .from('game_results')
      .select(
        `
        *,
        games (
          id,
          winning_team,
          duration,
          game_number,
          game_status,
          notes,
          match_series (
            series_date,
            series_type,
            id
          ),
          ban_picks (
            id,
            team,
            phase,
            champion_name,
            order_number
          )
        )
      `
      )
      .eq('member_id', id)
      .order('created_at', { ascending: false })
      .limit(15);

    if (recentGamesError) {
      console.error('Recent games error:', recentGamesError);
    }

    // 각 경기의 팀원/적팀 정보 가져오기
    const recentMatches: PlayerMatchDetail[] = [];

    if (recentGamesData && recentGamesData.length > 0) {
      for (const playerResult of recentGamesData) {
        const game = playerResult.games as any;

        // 같은 게임의 모든 플레이어 결과 가져오기
        const { data: allPlayersInGame } = await supabase
          .from('game_results')
          .select(
            `
            *,
            members (
              id,
              name,
              summoner_name
            )
          `
          )
          .eq('game_id', game.id);

        if (allPlayersInGame) {
          const teammates = allPlayersInGame.filter(
            (p) => p.team === playerResult.team && p.id !== playerResult.id
          );
          const enemies = allPlayersInGame.filter((p) => p.team !== playerResult.team);

          // ELO 변화량 가져오기
          const { data: ratingData } = await supabase
            .from('member_rating')
            .select('rating_change')
            .eq('game_id', game.id)
            .eq('member_id', id)
            .single();

          recentMatches.push({
            game: {
              ...game,
              game_results: allPlayersInGame,
            },
            playerResult,
            teammates,
            enemies,
            eloChange: ratingData?.rating_change || 0,
            matchDate: game.match_series?.series_date || game.created_at,
          });
        }
      }
    }

    // 7. ELO 히스토리 조회
    const { data: eloHistory } = await supabase
      .from('member_rating')
      .select('*')
      .eq('member_id', id)
      .order('created_at', { ascending: true });

    // 현재 ELO와 최고 ELO 업데이트
    if (eloHistory && eloHistory.length > 0) {
      stats.currentElo = eloHistory[eloHistory.length - 1].elo_rating;
      stats.peakElo = Math.max(...eloHistory.map((r) => r.elo_rating));
      stats.currentStreak = eloHistory[eloHistory.length - 1].streak_after || 0;
    }

    // 8. 티어 정보 계산 (순위 백분율 기반)
    const { data: rankingData } = await supabase
      .from('member_rankings')
      .select('ranking')
      .eq('id', id)
      .single();

    const { count: totalPlayers } = await supabase
      .from('member_rankings')
      .select('*', { count: 'exact', head: true });

    const ranking = rankingData?.ranking || 1;
    const total = totalPlayers || 1;
    const tierConfig = getTierByPercentile(ranking, total);

    return NextResponse.json({
      success: true,
      data: {
        member,
        stats,
        topChampions,
        positionStats,
        recentMatches,
        eloHistory: eloHistory || [],
        tierConfig,
      },
    } as MemberStatsResponse);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다',
      } as MemberStatsResponse,
      { status: 500 }
    );
  }
}

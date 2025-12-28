import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { RatingsResponse, MemberRanking, ChampionStats } from '@/features/ratings/api/types';

// GET /api/ratings - 전체 랭킹 조회
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('member_rankings')
      .select('*')
      .order('ranking', { ascending: true });

    if (error) {
      return NextResponse.json<RatingsResponse>(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const rankings = (data || []) as MemberRanking[];

    // 각 멤버의 모스트 챔피언 3개와 최근 게임 날짜, 평균 KDA 가져오기
    const enrichedRankings = await Promise.all(
      rankings.map(async (ranking) => {
        // 모스트 챔피언 가져오기
        const { data: championData } = await supabaseAdmin
          .from('game_results')
          .select('champion_name')
          .eq('member_id', ranking.id);

        const championStats = new Map<string, number>();
        (championData || []).forEach((result: { champion_name: string }) => {
          const count = championStats.get(result.champion_name) || 0;
          championStats.set(result.champion_name, count + 1);
        });

        const topChampions: ChampionStats[] = Array.from(championStats.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([championName, gamesPlayed]) => ({
            championName,
            gamesPlayed,
          }));

        // 최근 게임 날짜 가져오기
        const { data: lastGameData } = await supabaseAdmin
          .from('game_results')
          .select('games(match_series(series_date))')
          .eq('member_id', ranking.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const lastGameDate = lastGameData?.games?.match_series?.series_date || undefined;

        // 평균 KDA 계산
        const { data: kdaData } = await supabaseAdmin
          .from('game_results')
          .select('kills, deaths, assists')
          .eq('member_id', ranking.id);

        let avgKda = 0;
        let avgKills = 0;
        let avgDeaths = 0;
        let avgAssists = 0;

        if (kdaData && kdaData.length > 0) {
          const totalGames = kdaData.length;
          const totalKills = kdaData.reduce((sum: number, r: any) => sum + r.kills, 0);
          const totalDeaths = kdaData.reduce((sum: number, r: any) => sum + r.deaths, 0);
          const totalAssists = kdaData.reduce((sum: number, r: any) => sum + r.assists, 0);

          // KDA 점수 계산
          avgKda = totalDeaths > 0
            ? (totalKills + totalAssists) / totalDeaths
            : totalKills + totalAssists;

          // 평균 K/D/A 계산
          avgKills = totalKills / totalGames;
          avgDeaths = totalDeaths / totalGames;
          avgAssists = totalAssists / totalGames;
        }

        // 순위 변동 계산 (최근 게임의 ranking_before와 현재 ranking 비교)
        const { data: latestRatingData } = await supabaseAdmin
          .from('member_ratings')
          .select('ranking_before')
          .eq('member_id', ranking.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // ranking_before - 현재 ranking (순위가 낮을수록 좋으므로, 양수면 상승)
        const rankingChange = latestRatingData?.ranking_before
          ? latestRatingData.ranking_before - ranking.ranking
          : 0;

        return {
          ...ranking,
          topChampions,
          lastGameDate,
          avgKda,
          avgKills,
          avgDeaths,
          avgAssists,
          rankingChange,
        };
      })
    );

    return NextResponse.json<RatingsResponse>({
      success: true,
      data: enrichedRankings,
      totalPlayers: rankings.length,
    });
  } catch (error) {
    return NextResponse.json<RatingsResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : '랭킹 조회 실패',
      },
      { status: 500 }
    );
  }
}

/**
 * 포지션별 랭킹 계산 유틸리티
 */

import { PositionRanking, PositionRankingsMap, Position, RankingType } from '../api/types';

// 타입 임포트 (순환 참조 방지를 위해 필요한 것만)
interface Member {
  id: string;
  name: string;
  summoner_name: string;
  is_guest?: boolean;
}

interface GameResult {
  member_id: string;
  team: 'blue' | 'red';
  position: 'top' | 'jungle' | 'mid' | 'adc' | 'support';
  kills: number;
  deaths: number;
  assists: number;
  champion_damage: number;
  cs: number;
}

interface Game {
  id: string;
  game_status: string;
  winning_team?: 'blue' | 'red';
  game_results?: GameResult[];
}

interface MatchSeriesDetail {
  id: string;
  series_status: string;
  games?: Game[];
}

/**
 * 시리즈 데이터에서 포지션별 랭킹 계산
 */
export function calculatePositionRankings(
  series: MatchSeriesDetail[],
  members: Member[]
): PositionRankingsMap {
  // 1. 멤버별-포지션별 통계 맵 생성 (key: memberId_position)
  const statsMap = new Map<string, PositionRanking>();

  // 2. 완료된 시리즈의 모든 게임 결과 순회
  series.forEach((serie) => {
    if (serie.series_status !== 'completed') return;

    serie.games?.forEach((game) => {
      if (game.game_status !== 'completed') return;

      game.game_results?.forEach((result) => {
        if (!result.member_id) return;

        const key = `${result.member_id}_${result.position}`;
        const isWin = result.team === game.winning_team;

        if (!statsMap.has(key)) {
          const member = members.find((m) => m.id === result.member_id);
          statsMap.set(key, {
            memberId: result.member_id,
            memberName: member?.name || '-',
            summonerName: member?.summoner_name || '',
            position: result.position,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            totalKills: 0,
            totalDeaths: 0,
            totalAssists: 0,
            avgKills: 0,
            avgDeaths: 0,
            avgAssists: 0,
            avgKda: 0,
            totalDamage: 0,
            avgDamage: 0,
            totalCS: 0,
            avgCS: 0,
          });
        }

        const stats = statsMap.get(key)!;
        stats.gamesPlayed++;
        if (isWin) stats.wins++;
        else stats.losses++;
        stats.totalKills += result.kills;
        stats.totalDeaths += result.deaths;
        stats.totalAssists += result.assists;
        stats.totalDamage += result.champion_damage;
        stats.totalCS += result.cs;
      });
    });
  });

  // 3. 평균 계산
  const allStats = Array.from(statsMap.values()).map((stats) => {
    stats.winRate =
      stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed) * 100 : 0;
    stats.avgKills =
      stats.gamesPlayed > 0 ? stats.totalKills / stats.gamesPlayed : 0;
    stats.avgDeaths =
      stats.gamesPlayed > 0 ? stats.totalDeaths / stats.gamesPlayed : 0;
    stats.avgAssists =
      stats.gamesPlayed > 0 ? stats.totalAssists / stats.gamesPlayed : 0;
    stats.avgKda =
      stats.totalDeaths > 0
        ? (stats.totalKills + stats.totalAssists) / stats.totalDeaths
        : stats.totalKills + stats.totalAssists;
    stats.avgDamage =
      stats.gamesPlayed > 0 ? stats.totalDamage / stats.gamesPlayed : 0;
    stats.avgCS =
      stats.gamesPlayed > 0 ? stats.totalCS / stats.gamesPlayed : 0;
    return stats;
  });

  // 4. 최소 3경기 필터링
  const filteredStats = allStats.filter((stat) => stat.gamesPlayed >= 3);

  // 5. 용병 제외
  const nonGuestStats = filteredStats.filter((stat) => {
    const member = members.find((m) => m.id === stat.memberId);
    return member && !member.is_guest;
  });

  // 6. 포지션별로 그룹화
  const positionMap: PositionRankingsMap = {
    top: [],
    jungle: [],
    mid: [],
    adc: [],
    support: [],
  };

  nonGuestStats.forEach((stat) => {
    positionMap[stat.position].push(stat);
  });

  return positionMap;
}

/**
 * 랭킹 타입에 따라 정렬
 */
export function sortByRankingType(
  rankings: PositionRanking[],
  rankingType: RankingType
): PositionRanking[] {
  const sorted = [...rankings];

  switch (rankingType) {
    case 'winRate':
      // 승률: 승률 내림차순 → 경기 수 내림차순 → 이름 오름차순
      return sorted.sort((a, b) => {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        if (b.gamesPlayed !== a.gamesPlayed)
          return b.gamesPlayed - a.gamesPlayed;
        return a.memberName.localeCompare(b.memberName);
      });

    case 'damage':
      // 딜량: 평균 딜량 내림차순 → 경기 수 내림차순 → 이름 오름차순
      return sorted.sort((a, b) => {
        if (b.avgDamage !== a.avgDamage) return b.avgDamage - a.avgDamage;
        if (b.gamesPlayed !== a.gamesPlayed)
          return b.gamesPlayed - a.gamesPlayed;
        return a.memberName.localeCompare(b.memberName);
      });

    default:
      return sorted;
  }
}

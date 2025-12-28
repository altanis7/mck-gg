/**
 * ELO 레이팅 계산기
 *
 * 게임 완료 후 각 플레이어의 ELO 변동을 계산합니다.
 * - 팀 평균 ELO 차이 반영
 * - 연승/연패 보너스
 * - 랭킹 변동 추적
 */

import { supabaseAdmin } from '@/lib/supabase';
import {
  RatingChange,
  CalculateEloChangeParams,
  CalculateEloChangeResult,
  MemberEloInfo,
  GameParticipant,
} from '../api/types';
import { getInitialElo, clampElo } from './initialElo';

/**
 * 게임의 모든 플레이어 ELO 계산 (메인 함수)
 *
 * @param gameId 게임 ID
 * @returns 플레이어별 ELO 변동 정보 배열
 * @throws 게임이 완료되지 않았거나 참가자가 10명이 아닌 경우
 */
export async function calculateGameRatings(
  gameId: string
): Promise<RatingChange[]> {
  // 1. 게임 정보 조회 (승리 팀 확인)
  const { data: game, error: gameError } = await supabaseAdmin
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (gameError || !game) {
    throw new Error('게임을 찾을 수 없습니다');
  }

  if (game.game_status !== 'completed' || !game.winning_team) {
    throw new Error('게임이 아직 완료되지 않았습니다');
  }

  // 2. 게임 참가자 조회 (10명)
  const { data: gameResults, error: resultsError } = await supabaseAdmin
    .from('game_results')
    .select('member_id, team, position')
    .eq('game_id', gameId);

  if (resultsError || !gameResults) {
    throw new Error('게임 참가자 정보를 가져올 수 없습니다');
  }

  if (gameResults.length !== 10) {
    throw new Error(`게임 참가자가 10명이 아닙니다 (${gameResults.length}명)`);
  }

  const participants: GameParticipant[] = gameResults.map((r) => ({
    member_id: r.member_id,
    team: r.team as 'blue' | 'red',
    position: r.position as 'top' | 'jungle' | 'mid' | 'adc' | 'support',
  }));

  // 3. 참가자별 현재 ELO 조회
  const memberIds = participants.map((p) => p.member_id);
  const { data: members, error: membersError } = await supabaseAdmin
    .from('members')
    .select('id, name, summoner_name, solo_tier, current_elo, peak_elo, total_games, total_wins, current_streak')
    .in('id', memberIds);

  if (membersError || !members) {
    throw new Error('멤버 정보를 가져올 수 없습니다');
  }

  const memberElos = new Map<string, MemberEloInfo>(
    members.map((m) => [m.id, m as MemberEloInfo])
  );

  // 4. 게임 전 전체 랭킹 조회
  const rankingsBefore = await getCurrentRankings();

  // 5. 팀별 평균 ELO 계산
  const bluePlayers = participants.filter((p) => p.team === 'blue');
  const redPlayers = participants.filter((p) => p.team === 'red');

  const blueAvgElo = calculateAvgElo(bluePlayers, memberElos);
  const redAvgElo = calculateAvgElo(redPlayers, memberElos);

  // 6. 각 플레이어의 ELO 변동 계산
  const changes: RatingChange[] = [];

  for (const participant of participants) {
    const member = memberElos.get(participant.member_id);
    if (!member) {
      throw new Error(`멤버를 찾을 수 없습니다: ${participant.member_id}`);
    }

    const won = participant.team === game.winning_team;

    // 현재 ELO (없으면 초기 ELO)
    const currentElo = member.current_elo ?? getInitialElo(member.solo_tier);

    // ELO 변동 계산
    const { newElo, change, streakBonus, newStreak } = calculateEloChange({
      currentElo,
      teamAvgElo: participant.team === 'blue' ? blueAvgElo : redAvgElo,
      opponentAvgElo: participant.team === 'blue' ? redAvgElo : blueAvgElo,
      won,
      currentStreak: member.current_streak ?? 0,
      totalGames: member.total_games ?? 0,
    });

    changes.push({
      memberId: participant.member_id,
      memberName: member.name,
      team: participant.team,
      previousElo: currentElo,
      newElo,
      change,
      rankingBefore: rankingsBefore.get(participant.member_id) ?? 999,
      rankingAfter: 0, // 나중에 업데이트
      streakBonus,
      won,
    });

    // 7. members 테이블 업데이트
    await supabaseAdmin
      .from('members')
      .update({
        current_elo: newElo,
        peak_elo: Math.max(member.peak_elo ?? currentElo, newElo),
        total_games: (member.total_games ?? 0) + 1,
        total_wins: (member.total_wins ?? 0) + (won ? 1 : 0),
        current_streak: newStreak,
      })
      .eq('id', participant.member_id);

    // 8. member_ratings 테이블에 히스토리 저장
    await supabaseAdmin.from('member_ratings').insert({
      member_id: participant.member_id,
      game_id: gameId,
      elo_rating: newElo,
      previous_rating: currentElo,
      rating_change: change,
      ranking_before: rankingsBefore.get(participant.member_id) ?? 999,
      ranking_after: 0, // 나중에 업데이트
      team: participant.team,
      won,
      streak_before: member.current_streak ?? 0,
      streak_after: newStreak,
      streak_bonus: streakBonus,
    });
  }

  // 9. 게임 후 새 랭킹 조회 및 업데이트
  const rankingsAfter = await getCurrentRankings();

  for (const change of changes) {
    change.rankingAfter = rankingsAfter.get(change.memberId) ?? 999;

    // member_ratings 테이블의 ranking_after 업데이트
    await supabaseAdmin
      .from('member_ratings')
      .update({ ranking_after: change.rankingAfter })
      .eq('game_id', gameId)
      .eq('member_id', change.memberId);
  }

  return changes;
}

/**
 * 개별 플레이어의 ELO 변동 계산
 *
 * @param params 계산 파라미터
 * @returns ELO 변동 결과
 */
function calculateEloChange(
  params: CalculateEloChangeParams
): CalculateEloChangeResult {
  const {
    currentElo,
    teamAvgElo,
    opponentAvgElo,
    won,
    currentStreak,
    totalGames,
  } = params;

  // K-Factor (신규 유저는 더 큰 변동)
  const K = totalGames < 10 ? 40 : 32;

  // 예상 승률 (팀 평균 기준)
  const eloDiff = opponentAvgElo - teamAvgElo;
  const expectedScore = 1 / (1 + Math.pow(10, eloDiff / 400));

  // 기본 점수 변동
  const actualScore = won ? 1 : 0;
  const baseChange = K * (actualScore - expectedScore);

  // 연승/연패 보너스 계산
  const streakBonus = calculateStreakBonus(currentStreak, won);

  // 최종 변동 점수
  const totalChange = Math.round(baseChange + streakBonus);

  // 새 ELO (1000~2000 제한)
  const newElo = clampElo(currentElo + totalChange);

  // 새 연승/연패 상태
  const newStreak = calculateNewStreak(currentStreak, won);

  return {
    newElo,
    change: totalChange,
    streakBonus,
    newStreak,
  };
}

/**
 * 연승/연패 보너스 계산
 *
 * @param currentStreak 현재 연승/연패 상태 (양수: 연승, 음수: 연패)
 * @param won 승리 여부
 * @returns 보너스 점수 (양수 또는 음수)
 */
function calculateStreakBonus(currentStreak: number, won: boolean): number {
  if (won && currentStreak >= 3) {
    // 연승 보너스: +3 ~ +15
    return Math.min(currentStreak - 2, 5) * 3;
  } else if (!won && currentStreak <= -3) {
    // 연패 페널티: -2 ~ -10
    return -Math.min(Math.abs(currentStreak) - 2, 5) * 2;
  }
  return 0;
}

/**
 * 새 연승/연패 상태 계산
 *
 * @param currentStreak 현재 연승/연패 상태
 * @param won 승리 여부
 * @returns 새 연승/연패 상태
 */
function calculateNewStreak(currentStreak: number, won: boolean): number {
  if (won) {
    return currentStreak >= 0 ? currentStreak + 1 : 1;
  } else {
    return currentStreak <= 0 ? currentStreak - 1 : -1;
  }
}

/**
 * 팀 평균 ELO 계산
 *
 * @param players 팀 플레이어 목록
 * @param memberElos 멤버 ELO 정보 맵
 * @returns 팀 평균 ELO
 */
function calculateAvgElo(
  players: GameParticipant[],
  memberElos: Map<string, MemberEloInfo>
): number {
  const sum = players.reduce((acc, p) => {
    const member = memberElos.get(p.member_id);
    if (!member) return acc;
    const elo = member.current_elo ?? getInitialElo(member.solo_tier);
    return acc + elo;
  }, 0);
  return Math.round(sum / players.length);
}

/**
 * 현재 전체 랭킹 조회
 *
 * @returns 멤버 ID -> 순위 맵
 */
async function getCurrentRankings(): Promise<Map<string, number>> {
  const { data: rankings } = await supabaseAdmin
    .from('member_rankings')
    .select('id, ranking')
    .order('ranking', { ascending: true });

  const rankingMap = new Map<string, number>();
  rankings?.forEach((member) => {
    rankingMap.set(member.id, member.ranking);
  });

  return rankingMap;
}

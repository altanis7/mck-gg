'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMembers } from '@/features/members/hooks/useMembers';
import { useCreateMatch } from '../hooks/useCreateMatch';
import { useCreateGameResult } from '../hooks/useCreateGameResult';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage';
import { Loading } from '@/shared/components/ui/Loading';
import { CreateGameResultDto } from '../api/types';

const POSITIONS = ['top', 'jungle', 'mid', 'adc', 'support'] as const;
type Position = (typeof POSITIONS)[number];

interface PlayerData {
  member_id: string;
  position: Position;
  champion_name: string;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  champion_damage: number;
  damage_taken: number;
  gold_earned: number;
  vision_score: number;
  wards_placed: number;
  wards_destroyed: number;
}

export function MatchRegistrationForm() {
  const router = useRouter();
  const { data: members, isLoading: membersLoading } = useMembers();
  const createMatchMutation = useCreateMatch();
  const createGameResultMutation = useCreateGameResult();

  // 경기 기본 정보
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [duration, setDuration] = useState('');
  const [winningTeam, setWinningTeam] = useState<'blue' | 'red'>('blue');

  // 블루팀 선수 (5명)
  const [bluePlayers, setBluePlayers] = useState<PlayerData[]>(
    POSITIONS.map((pos) => ({
      member_id: '',
      position: pos,
      champion_name: '',
      kills: 0,
      deaths: 0,
      assists: 0,
      cs: 0,
      champion_damage: 0,
      damage_taken: 0,
      gold_earned: 0,
      vision_score: 0,
      wards_placed: 0,
      wards_destroyed: 0,
    }))
  );

  // 레드팀 선수 (5명)
  const [redPlayers, setRedPlayers] = useState<PlayerData[]>(
    POSITIONS.map((pos) => ({
      member_id: '',
      position: pos,
      champion_name: '',
      kills: 0,
      deaths: 0,
      assists: 0,
      cs: 0,
      champion_damage: 0,
      damage_taken: 0,
      gold_earned: 0,
      vision_score: 0,
      wards_placed: 0,
      wards_destroyed: 0,
    }))
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    if (!matchDate || !matchTime || !duration) {
      setError('경기 날짜, 시간, 시간을 모두 입력해주세요');
      return;
    }

    // 블루팀 선수 검증
    for (const player of bluePlayers) {
      if (!player.member_id || !player.champion_name) {
        setError('블루팀의 모든 선수와 챔피언을 선택해주세요');
        return;
      }
    }

    // 레드팀 선수 검증
    for (const player of redPlayers) {
      if (!player.member_id || !player.champion_name) {
        setError('레드팀의 모든 선수와 챔피언을 선택해주세요');
        return;
      }
    }

    // 중복 선수 체크
    const allMemberIds = [
      ...bluePlayers.map((p) => p.member_id),
      ...redPlayers.map((p) => p.member_id),
    ];
    const uniqueMemberIds = new Set(allMemberIds);
    if (uniqueMemberIds.size !== 10) {
      setError('같은 선수가 중복으로 선택되었습니다');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. 경기 생성
      const matchDateTime = `${matchDate}T${matchTime}:00`;
      const match = await createMatchMutation.mutateAsync({
        match_date: new Date(matchDateTime).toISOString(),
        duration: parseInt(duration) * 60, // 분 → 초
        winning_team: winningTeam,
      });

      // 2. 모든 선수 결과를 병렬로 등록
      const allPlayers = [
        ...bluePlayers.map(player => ({ ...player, team: 'blue' as const })),
        ...redPlayers.map(player => ({ ...player, team: 'red' as const })),
      ];

      await Promise.all(
        allPlayers.map(player => {
          const gameResult: CreateGameResultDto = {
            member_id: player.member_id,
            team: player.team,
            position: player.position,
            champion_name: player.champion_name,
            kills: player.kills,
            deaths: player.deaths,
            assists: player.assists,
            cs: player.cs,
            champion_damage: player.champion_damage,
            damage_taken: player.damage_taken,
            gold_earned: player.gold_earned,
            vision_score: player.vision_score,
            wards_placed: player.wards_placed,
            wards_destroyed: player.wards_destroyed,
          };

          return createGameResultMutation.mutateAsync({
            matchId: match.id,
            data: gameResult,
          });
        })
      );

      // 성공 - 경기 상세 페이지로 이동
      router.push(`/admin/matches/${match.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '경기 등록 중 오류가 발생했습니다');
      setIsSubmitting(false);
    }
  };

  if (membersLoading) {
    return <Loading />;
  }

  const memberOptions = members?.map((m) => ({
    value: m.id,
    label: `${m.name} (${m.summoner_name})`,
  })) || [];

  const updateBluePlayer = (index: number, field: keyof PlayerData, value: any) => {
    const updated = [...bluePlayers];
    updated[index] = { ...updated[index], [field]: value };
    setBluePlayers(updated);
  };

  const updateRedPlayer = (index: number, field: keyof PlayerData, value: any) => {
    const updated = [...redPlayers];
    updated[index] = { ...updated[index], [field]: value };
    setRedPlayers(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 경기 기본 정보 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">경기 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="경기 날짜"
            type="date"
            value={matchDate}
            onChange={(e) => setMatchDate(e.target.value)}
            required
          />
          <Input
            label="경기 시간"
            type="time"
            value={matchTime}
            onChange={(e) => setMatchTime(e.target.value)}
            required
          />
          <Input
            label="경기 시간 (분)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="예: 35"
            required
          />
        </div>
        <div className="mt-4">
          <Select
            label="승리 팀"
            value={winningTeam}
            onChange={(e) => setWinningTeam(e.target.value as 'blue' | 'red')}
            options={[
              { value: 'blue', label: '블루팀' },
              { value: 'red', label: '레드팀' },
            ]}
          />
        </div>
      </div>

      {/* 블루팀 */}
      <div className="bg-blue-50 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-blue-700">블루팀</h2>
        <div className="space-y-4">
          {POSITIONS.map((position, index) => (
            <div key={position} className="bg-white p-4 rounded">
              <h3 className="font-semibold mb-3 capitalize">{position}</h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <Select
                  label="선수"
                  value={bluePlayers[index].member_id}
                  onChange={(e) => updateBluePlayer(index, 'member_id', e.target.value)}
                  options={[{ value: '', label: '선택' }, ...memberOptions]}
                  required
                />
                <Input
                  label="챔피언"
                  value={bluePlayers[index].champion_name}
                  onChange={(e) => updateBluePlayer(index, 'champion_name', e.target.value)}
                  placeholder="챔피언 이름"
                  required
                />
                <Input
                  label="K"
                  type="number"
                  value={bluePlayers[index].kills}
                  onChange={(e) => updateBluePlayer(index, 'kills', parseInt(e.target.value))}
                />
                <Input
                  label="D"
                  type="number"
                  value={bluePlayers[index].deaths}
                  onChange={(e) => updateBluePlayer(index, 'deaths', parseInt(e.target.value))}
                />
                <Input
                  label="A"
                  type="number"
                  value={bluePlayers[index].assists}
                  onChange={(e) => updateBluePlayer(index, 'assists', parseInt(e.target.value))}
                />
                <Input
                  label="CS"
                  type="number"
                  value={bluePlayers[index].cs}
                  onChange={(e) => updateBluePlayer(index, 'cs', parseInt(e.target.value))}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 레드팀 */}
      <div className="bg-red-50 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-red-700">레드팀</h2>
        <div className="space-y-4">
          {POSITIONS.map((position, index) => (
            <div key={position} className="bg-white p-4 rounded">
              <h3 className="font-semibold mb-3 capitalize">{position}</h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <Select
                  label="선수"
                  value={redPlayers[index].member_id}
                  onChange={(e) => updateRedPlayer(index, 'member_id', e.target.value)}
                  options={[{ value: '', label: '선택' }, ...memberOptions]}
                  required
                />
                <Input
                  label="챔피언"
                  value={redPlayers[index].champion_name}
                  onChange={(e) => updateRedPlayer(index, 'champion_name', e.target.value)}
                  placeholder="챔피언 이름"
                  required
                />
                <Input
                  label="K"
                  type="number"
                  value={redPlayers[index].kills}
                  onChange={(e) => updateRedPlayer(index, 'kills', parseInt(e.target.value))}
                />
                <Input
                  label="D"
                  type="number"
                  value={redPlayers[index].deaths}
                  onChange={(e) => updateRedPlayer(index, 'deaths', parseInt(e.target.value))}
                />
                <Input
                  label="A"
                  type="number"
                  value={redPlayers[index].assists}
                  onChange={(e) => updateRedPlayer(index, 'assists', parseInt(e.target.value))}
                />
                <Input
                  label="CS"
                  type="number"
                  value={redPlayers[index].cs}
                  onChange={(e) => updateRedPlayer(index, 'cs', parseInt(e.target.value))}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {(error || createMatchMutation.error || createGameResultMutation.error) && (
        <ErrorMessage
          message={error || createMatchMutation.error?.message || createGameResultMutation.error?.message || ''}
        />
      )}

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting || createMatchMutation.isPending || createGameResultMutation.isPending}
          className="flex-1"
        >
          {isSubmitting ? '등록 중...' : '경기 등록'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          취소
        </Button>
      </div>
    </form>
  );
}

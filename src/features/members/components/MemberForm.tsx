'use client';

import { useState, FormEvent } from 'react';
import { Member, CreateMemberDto } from '../api/types';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';

interface MemberFormProps {
  member?: Member;
  onSubmit: (data: CreateMemberDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const positionOptions = [
  { value: 'top', label: 'Top' },
  { value: 'jungle', label: 'Jungle' },
  { value: 'mid', label: 'Mid' },
  { value: 'adc', label: 'ADC' },
  { value: 'support', label: 'Support' },
];

const tierOptions = [
  { value: '', label: '선택 안 함' },
  { value: 'IRON', label: 'Iron' },
  { value: 'BRONZE', label: 'Bronze' },
  { value: 'SILVER', label: 'Silver' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'PLATINUM', label: 'Platinum' },
  { value: 'EMERALD', label: 'Emerald' },
  { value: 'DIAMOND', label: 'Diamond' },
  { value: 'MASTER', label: 'Master' },
  { value: 'GRANDMASTER', label: 'Grandmaster' },
  { value: 'CHALLENGER', label: 'Challenger' },
];

const rankOptions = [
  { value: '', label: '선택 안 함' },
  { value: 'I', label: 'I' },
  { value: 'II', label: 'II' },
  { value: 'III', label: 'III' },
  { value: 'IV', label: 'IV' },
];

export function MemberForm({
  member,
  onSubmit,
  onCancel,
  isLoading = false,
}: MemberFormProps) {
  const [name, setName] = useState(member?.name || '');
  const [summonerName, setSummonerName] = useState(member?.summoner_name || '');
  const [riotId, setRiotId] = useState(member?.riot_id || '');
  const [soloTier, setSoloTier] = useState(member?.solo_tier || '');
  const [soloRank, setSoloRank] = useState(member?.solo_rank || '');
  const [mainPosition, setMainPosition] = useState(member?.main_position || '');
  const [subPosition, setSubPosition] = useState(member?.sub_position || '');
  const [isGuest, setIsGuest] = useState(member?.is_guest || false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await onSubmit({
      name,
      summoner_name: summonerName,
      riot_id: riotId,
      solo_tier: soloTier || undefined,
      solo_rank: soloRank || undefined,
      main_position: mainPosition,
      sub_position: subPosition || undefined,
      is_guest: isGuest,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름을 입력하세요"
        required
        disabled={isLoading}
      />

      <Input
        label="소환사명"
        value={summonerName}
        onChange={(e) => setSummonerName(e.target.value)}
        placeholder="소환사명을 입력하세요"
        required
        disabled={isLoading}
      />

      <Input
        label="Riot ID"
        value={riotId}
        onChange={(e) => setRiotId(e.target.value)}
        placeholder="예: MCK#KR1"
        required
        disabled={isLoading}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="솔로 티어"
          value={soloTier}
          onChange={(e) => setSoloTier(e.target.value)}
          options={tierOptions}
          disabled={isLoading}
        />

        <Select
          label="솔로 랭크"
          value={soloRank}
          onChange={(e) => setSoloRank(e.target.value)}
          options={rankOptions}
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          주 포지션 <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {positionOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={mainPosition === option.value ? 'primary' : 'outline'}
              onClick={() => setMainPosition(option.value)}
              disabled={isLoading}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          부 포지션 (선택)
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={!subPosition ? 'primary' : 'outline'}
            onClick={() => setSubPosition('')}
            disabled={isLoading}
          >
            없음
          </Button>
          {positionOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={subPosition === option.value ? 'primary' : 'outline'}
              onClick={() => setSubPosition(option.value)}
              disabled={isLoading}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_guest"
          checked={isGuest}
          onChange={(e) => setIsGuest(e.target.checked)}
          disabled={isLoading}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="is_guest" className="text-sm font-medium text-gray-700">
          용병
        </label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '처리 중...' : member ? '수정' : '생성'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          취소
        </Button>
      </div>
    </form>
  );
}

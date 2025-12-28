import { ChampionAvatar } from '@/shared/components/ui/ChampionAvatar';
import { BanPick } from '../api/types';

interface ChampionBanListProps {
  bans: BanPick[];
  team: 'blue' | 'red';
}

export function ChampionBanList({ bans, team }: ChampionBanListProps) {
  if (bans.length === 0) {
    return <p className="text-sm text-gray-400">밴 없음</p>;
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {bans.map((ban) => (
        <ChampionAvatar
          key={ban.id}
          championName={ban.champion_name}
          size="sm"
          variant={team}
          showTooltip
        />
      ))}
    </div>
  );
}

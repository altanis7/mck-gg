import { cn } from '@/lib/utils';
import { ChampionAvatar } from '@/shared/components/ui/ChampionAvatar';
import { GameDetail } from '../api/types';

interface GameAccordionHeaderProps {
  game: GameDetail;
  isOpen: boolean;
}

export function GameAccordionHeader({ game, isOpen }: GameAccordionHeaderProps) {
  // 포지션 순서로 정렬
  const positionOrder: Record<string, number> = {
    top: 1,
    jungle: 2,
    mid: 3,
    adc: 4,
    support: 5,
  };

  const sortByPosition = (results: typeof game.game_results) => {
    return [...results].sort((a, b) => {
      return (positionOrder[a.position] || 99) - (positionOrder[b.position] || 99);
    });
  };

  const blueTeam = sortByPosition(game.game_results.filter((r) => r.team === 'blue'));
  const redTeam = sortByPosition(game.game_results.filter((r) => r.team === 'red'));

  const bgColor =
    game.winning_team === 'blue'
      ? 'bg-blue-600/20 border-blue-500/50'
      : 'bg-red-600/20 border-red-500/50';

  const borderColor =
    game.winning_team === 'blue' ? 'border-l-blue-500' : 'border-l-red-500';

  return (
    <div
      className={cn(
        'relative min-h-[120px] border border-l-8 flex items-center gap-4 px-4 py-3',
        bgColor,
        borderColor,
        'hover:brightness-110 transition-all'
      )}
    >
      {/* 좌측: 세트 및 시간 정보 */}
      <div className="flex flex-col justify-center items-center w-16 flex-shrink-0">
        <div className="text-xs text-gray-400">{game.game_number}세트</div>
        {game.duration && (
          <div className="text-xs text-gray-400 mt-1">
            {Math.floor(game.duration / 60)}:
            {(game.duration % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* 블루팀 플레이어 리스트 (세로) */}
      <div className="flex-1 min-w-0">
        <div className="space-y-1">
          {blueTeam.map((result) => (
            <div key={result.id} className="flex items-center gap-2">
              <ChampionAvatar
                championName={result.champion_name}
                size="xs"
                shape="circle"
              />
              <span className="text-xs text-white font-medium truncate">
                {result.members?.summoner_name || result.members?.name || '-'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 레드팀 플레이어 리스트 (세로) */}
      <div className="flex-1 min-w-0">
        <div className="space-y-1">
          {redTeam.map((result) => (
            <div key={result.id} className="flex items-center gap-2">
              <ChampionAvatar
                championName={result.champion_name}
                size="xs"
                shape="circle"
              />
              <span className="text-xs text-white font-medium truncate">
                {result.members?.summoner_name || result.members?.name || '-'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 우측: 펼침 아이콘 (원형 배경) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-700/50 flex items-center justify-center">
        <svg
          className={cn(
            'w-3 h-3 text-gray-300 transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

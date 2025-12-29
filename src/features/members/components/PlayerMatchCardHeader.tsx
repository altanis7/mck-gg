import { PlayerMatchDetail } from '../api/types';
import { ChampionAvatar } from '@/shared/components/ui/ChampionAvatar';
import {
  calculateKDA,
  formatKDA,
  getKdaColor,
  getPositionShort,
  formatCSPerMin,
  formatDamage,
  formatGameDuration,
} from '../utils/statsCalculations';
import { cn } from '@/lib/utils';

interface PlayerMatchCardHeaderProps {
  match: PlayerMatchDetail;
  playerId: string;
  isOpen: boolean;
}

export function PlayerMatchCardHeader({
  match,
  playerId,
  isOpen,
}: PlayerMatchCardHeaderProps) {
  const { game, playerResult, teammates, eloChange } = match;

  // 승리 여부 확인
  const won =
    (playerResult.team === 'blue' && game.winning_team === 'blue') ||
    (playerResult.team === 'red' && game.winning_team === 'red');

  // KDA 계산
  const kda = calculateKDA(
    playerResult.kills || 0,
    playerResult.deaths || 0,
    playerResult.assists || 0
  );
  const kdaColor = getKdaColor(kda);

  // CS/min 계산
  const csPerMin = game.duration
    ? formatCSPerMin(parseFloat(formatCSPerMin(playerResult.cs / (game.duration / 60))))
    : '0.0';

  return (
    <div
      className={cn(
        'p-4 cursor-pointer transition-colors',
        won
          ? 'bg-blue-950/20 border-l-4 border-l-blue-500 hover:bg-blue-950/30'
          : 'bg-red-950/20 border-l-4 border-l-red-500 hover:bg-red-950/30'
      )}
    >
      {/* 데스크톱 레이아웃 */}
      <div className="hidden md:flex items-center gap-4">
        {/* 승/패 + 시간 */}
        <div className="flex flex-col items-center gap-1 w-16">
          <span
            className={cn(
              'text-xs font-bold px-2 py-0.5 rounded',
              won
                ? 'bg-blue-500 text-white'
                : 'bg-red-500 text-white'
            )}
          >
            {won ? '승리' : '패배'}
          </span>
          <span className="text-xs text-gray-400">
            {game.duration ? formatGameDuration(game.duration) : '-'}
          </span>
        </div>

        {/* 챔피언 + 포지션 */}
        <div className="flex items-center gap-2 w-32">
          <ChampionAvatar
            championName={playerResult.champion_name}
            size="md"
            shape="circle"
            showTooltip
          />
          <span className="text-xs font-semibold text-gray-400">
            {getPositionShort(playerResult.position)}
          </span>
        </div>

        {/* KDA */}
        <div className="flex items-center gap-2 w-40">
          <span className="text-sm text-white">
            {playerResult.kills}/{playerResult.deaths}/{playerResult.assists}
          </span>
          <span
            className="px-2 py-0.5 rounded text-xs font-bold"
            style={{ backgroundColor: kdaColor + '33', color: kdaColor }}
          >
            {formatKDA(kda)}
          </span>
        </div>

        {/* CS */}
        <div className="text-sm text-gray-300 w-24">
          CS {playerResult.cs} ({csPerMin}/분)
        </div>

        {/* 딜량 */}
        <div className="text-sm text-gray-300 w-20">
          {formatDamage(playerResult.champion_damage)}
        </div>

        {/* 팀원 미리보기 */}
        <div className="flex items-center gap-1 flex-1">
          <span className="text-xs text-gray-500 mr-2">팀:</span>
          {teammates.slice(0, 4).map((teammate, idx) => (
            <ChampionAvatar
              key={idx}
              championName={teammate.champion_name}
              size="xs"
              shape="circle"
            />
          ))}
        </div>

        {/* ELO 변화 */}
        <div className="w-20 text-right">
          <span
            className={cn(
              'text-sm font-bold',
              eloChange >= 0 ? 'text-green-500' : 'text-red-500'
            )}
          >
            {eloChange >= 0 ? '+' : ''}
            {eloChange} LP
          </span>
        </div>

        {/* 펼침 아이콘 */}
        <div className="w-6">
          <svg
            className={cn(
              'w-5 h-5 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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

      {/* 모바일 레이아웃 */}
      <div className="md:hidden">
        <div className="flex items-center gap-2 mb-2">
          {/* 승/패 */}
          <span
            className={cn(
              'text-xs font-bold px-2 py-0.5 rounded',
              won ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
            )}
          >
            {won ? '승' : '패'}
          </span>

          {/* 챔피언 */}
          <ChampionAvatar
            championName={playerResult.champion_name}
            size="sm"
            shape="circle"
            showTooltip
          />

          {/* 포지션 */}
          <span className="text-xs font-semibold text-gray-400">
            {getPositionShort(playerResult.position)}
          </span>

          {/* ELO */}
          <span
            className={cn(
              'text-xs font-bold ml-auto',
              eloChange >= 0 ? 'text-green-500' : 'text-red-500'
            )}
          >
            {eloChange >= 0 ? '+' : ''}
            {eloChange} LP
          </span>

          {/* 펼침 아이콘 */}
          <svg
            className={cn(
              'w-4 h-4 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="text-white">
            {playerResult.kills}/{playerResult.deaths}/{playerResult.assists} (
            <span style={{ color: kdaColor }}>{formatKDA(kda)}</span>)
          </div>
          <div className="text-gray-400">
            CS {playerResult.cs} • {formatDamage(playerResult.champion_damage)}
          </div>
        </div>
      </div>
    </div>
  );
}

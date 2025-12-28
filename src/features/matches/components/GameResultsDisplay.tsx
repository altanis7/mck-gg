import { ChampionAvatar } from '@/shared/components/ui/ChampionAvatar';
import { ChampionBanList } from './ChampionBanList';
import { GameDetail } from '../api/types';

interface GameResultsDisplayProps {
  game: GameDetail;
}

export function GameResultsDisplay({ game }: GameResultsDisplayProps) {
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

  const calculateKDA = (kills: number, deaths: number, assists: number) => {
    if (deaths === 0) return ((kills + assists) / 1).toFixed(2);
    return ((kills + assists) / deaths).toFixed(2);
  };

  const getPositionShort = (position: string): string => {
    const positionMap: Record<string, string> = {
      'top': 'TOP',
      'jungle': 'JUG',
      'mid': 'MID',
      'adc': 'ADC',
      'support': 'SUP',
    };
    return positionMap[position.toLowerCase()] || position.toUpperCase();
  };

  // Helper functions for OP.GG style
  const getTeamMaxDamage = (team: typeof blueTeam) => {
    return Math.max(...team.map((p) => p.champion_damage), 1);
  };

  const getCSPerMin = (cs: number, duration: number | null | undefined) => {
    if (!duration) return '0.0';
    return (cs / (duration / 60)).toFixed(1);
  };

  const blueBgColor = game.winning_team === 'blue' ? 'bg-blue-950/30' : 'bg-blue-950/20';
  const redBgColor = game.winning_team === 'red' ? 'bg-red-950/30' : 'bg-red-950/20';

  return (
    <div className="space-y-4">
      {/* 게임 정보 헤더 - OP.GG 스타일 */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-sm backdrop-blur-sm p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {game.winning_team && (
              <div
                className={`px-3 py-1 rounded font-bold text-sm ${
                  game.winning_team === 'blue'
                    ? 'bg-blue-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {game.winning_team === 'blue' ? '블루팀' : '레드팀'} 승리
              </div>
            )}
            {game.duration && (
              <span className="text-sm text-gray-300">
                {Math.floor(game.duration / 60)}분 {game.duration % 60}초
              </span>
            )}
            <span className="text-xs text-gray-400">
              {game.game_number}게임
            </span>
          </div>
        </div>
        {game.notes && (
          <p className="mt-3 text-sm text-gray-200 bg-slate-900/50 p-2 rounded">
            {game.notes}
          </p>
        )}
      </div>

      {/* 밴픽 정보 - OP.GG 스타일 */}
      {game.ban_picks && game.ban_picks.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-sm backdrop-blur-sm p-4">
          <div className="flex items-center justify-between gap-8">
            {/* 블루팀 밴 */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-500 w-8">밴</span>
              <div className="flex gap-1">
                <ChampionBanList
                  bans={game.ban_picks
                    .filter((bp) => bp.team === 'blue' && bp.phase === 'ban')
                    .sort((a, b) => a.order_number - b.order_number)}
                  team="blue"
                />
              </div>
            </div>

            {/* 레드팀 밴 */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <ChampionBanList
                  bans={game.ban_picks
                    .filter((bp) => bp.team === 'red' && bp.phase === 'ban')
                    .sort((a, b) => a.order_number - b.order_number)}
                  team="red"
                />
              </div>
              <span className="text-xs font-semibold text-gray-500 w-8 text-right">밴</span>
            </div>
          </div>
        </div>
      )}

      {/* 블루팀 결과 - OP.GG 스타일 */}
      <div className={`rounded-lg p-4 ${blueBgColor}`}>
        <h3 className="text-sm font-bold mb-3 text-blue-400 uppercase">블루팀</h3>
        <div className="space-y-1">
          {blueTeam.map((result) => {
            const maxDamage = getTeamMaxDamage(blueTeam);
            const damagePercent = (result.champion_damage / maxDamage) * 100;
            const csPerMin = getCSPerMin(result.cs, game.duration);
            const kda = calculateKDA(result.kills, result.deaths, result.assists);

            return (
              <div
                key={result.id}
                className="bg-slate-900/50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* 모바일 레이아웃 */}
                <div className="md:hidden p-2">
                  {/* 상단: 아바타 + 이름 + 포지션 */}
                  <div className="flex items-center gap-2 mb-2">
                    {/* 챔피언 아바타 (작게) */}
                    <div className="relative">
                      <ChampionAvatar
                        championName={result.champion_name}
                        size="sm"
                        shape="circle"
                        showTooltip
                      />
                    </div>

                    {/* 플레이어 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          {getPositionShort(result.position)}
                        </span>
                      </div>
                      <div className="font-semibold text-sm text-white truncate">
                        {result.members?.name || '-'}
                      </div>
                    </div>

                    {/* KDA 비율 배지 */}
                    <div className="px-2 py-1 bg-slate-700/50 rounded text-xs font-bold text-gray-200">
                      {kda}
                    </div>
                  </div>

                  {/* 하단: 통계 */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {/* KDA */}
                      <div>
                        <span className="font-bold text-white">
                          {result.kills}/{result.deaths}/{result.assists}
                        </span>
                      </div>

                      {/* CS */}
                      <div className="text-gray-300">
                        CS <span className="font-semibold text-white">{result.cs}</span> ({csPerMin})
                      </div>
                    </div>

                    {/* 피해량 */}
                    <div className="text-gray-300">
                      <span className="font-semibold text-white">
                        {(result.champion_damage / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </div>

                  {/* 피해량 진행바 */}
                  <div className="mt-2">
                    <div className="w-full bg-slate-600 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${damagePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 데스크톱 레이아웃 */}
                <div className="hidden md:flex items-center gap-3 p-3">
                  {/* 챔피언 아바타 */}
                  <ChampionAvatar
                    championName={result.champion_name}
                    size="lg"
                    shape="circle"
                    showTooltip
                  />

                  {/* 포지션 */}
                  <div className="w-12">
                    <span className="text-xs font-semibold text-gray-300 uppercase">
                      {getPositionShort(result.position)}
                    </span>
                  </div>

                  {/* 플레이어 정보 */}
                  <div className="w-32">
                    <div className="font-semibold text-sm text-white">
                      {result.members?.name || '-'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.members?.summoner_name || ''}
                    </div>
                  </div>

                  {/* KDA */}
                  <div className="flex items-center gap-2 w-40">
                    <span className="font-bold text-white">
                      {result.kills} / {result.deaths} / {result.assists}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-700/50 rounded text-xs font-semibold text-gray-200">
                      {kda}
                    </span>
                  </div>

                  {/* CS */}
                  <div className="text-center w-24">
                    <div className="font-semibold text-sm text-white">{result.cs}</div>
                    <div className="text-xs text-gray-500">{csPerMin} /분</div>
                  </div>

                  {/* 피해량 진행바 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">피해량</span>
                      <span className="font-semibold text-white">
                        {result.champion_damage.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${damagePercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 레드팀 결과 - OP.GG 스타일 */}
      <div className={`rounded-lg p-4 ${redBgColor}`}>
        <h3 className="text-sm font-bold mb-3 text-red-400 uppercase">레드팀</h3>
        <div className="space-y-1">
          {redTeam.map((result) => {
            const maxDamage = getTeamMaxDamage(redTeam);
            const damagePercent = (result.champion_damage / maxDamage) * 100;
            const csPerMin = getCSPerMin(result.cs, game.duration);
            const kda = calculateKDA(result.kills, result.deaths, result.assists);

            return (
              <div
                key={result.id}
                className="bg-slate-900/50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* 모바일 레이아웃 */}
                <div className="md:hidden p-2">
                  {/* 상단: 아바타 + 이름 + 포지션 */}
                  <div className="flex items-center gap-2 mb-2">
                    {/* 챔피언 아바타 (작게) */}
                    <div className="relative">
                      <ChampionAvatar
                        championName={result.champion_name}
                        size="sm"
                        shape="circle"
                        showTooltip
                      />
                    </div>

                    {/* 플레이어 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          {getPositionShort(result.position)}
                        </span>
                      </div>
                      <div className="font-semibold text-sm text-white truncate">
                        {result.members?.name || '-'}
                      </div>
                    </div>

                    {/* KDA 비율 배지 */}
                    <div className="px-2 py-1 bg-slate-700/50 rounded text-xs font-bold text-gray-200">
                      {kda}
                    </div>
                  </div>

                  {/* 하단: 통계 */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {/* KDA */}
                      <div>
                        <span className="font-bold text-white">
                          {result.kills}/{result.deaths}/{result.assists}
                        </span>
                      </div>

                      {/* CS */}
                      <div className="text-gray-300">
                        CS <span className="font-semibold text-white">{result.cs}</span> ({csPerMin})
                      </div>
                    </div>

                    {/* 피해량 */}
                    <div className="text-gray-300">
                      <span className="font-semibold text-white">
                        {(result.champion_damage / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </div>

                  {/* 피해량 진행바 */}
                  <div className="mt-2">
                    <div className="w-full bg-slate-600 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-400 to-red-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${damagePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 데스크톱 레이아웃 */}
                <div className="hidden md:flex items-center gap-3 p-3">
                  {/* 챔피언 아바타 */}
                  <ChampionAvatar
                    championName={result.champion_name}
                    size="lg"
                    shape="circle"
                    showTooltip
                  />

                  {/* 포지션 */}
                  <div className="w-12">
                    <span className="text-xs font-semibold text-gray-300 uppercase">
                      {getPositionShort(result.position)}
                    </span>
                  </div>

                  {/* 플레이어 정보 */}
                  <div className="w-32">
                    <div className="font-semibold text-sm text-white">
                      {result.members?.name || '-'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.members?.summoner_name || ''}
                    </div>
                  </div>

                  {/* KDA */}
                  <div className="flex items-center gap-2 w-40">
                    <span className="font-bold text-white">
                      {result.kills} / {result.deaths} / {result.assists}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-700/50 rounded text-xs font-semibold text-gray-200">
                      {kda}
                    </span>
                  </div>

                  {/* CS */}
                  <div className="text-center w-24">
                    <div className="font-semibold text-sm text-white">{result.cs}</div>
                    <div className="text-xs text-gray-500">{csPerMin} /분</div>
                  </div>

                  {/* 피해량 진행바 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">피해량</span>
                      <span className="font-semibold text-white">
                        {result.champion_damage.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${damagePercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

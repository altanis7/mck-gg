import { PlayerChampionStats } from '../api/types';
import { ChampionAvatar } from '@/shared/components/ui/ChampionAvatar';
import { getKdaColor, getWinRateColor } from '../utils/statsCalculations';

interface MostPlayedChampionsProps {
  champions: PlayerChampionStats[];
}

export function MostPlayedChampions({ champions }: MostPlayedChampionsProps) {
  if (champions.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">모스트 챔피언</h3>
        <div className="text-center py-6 text-gray-500">
          챔피언 기록이 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">모스트 챔피언</h3>
      <div className="space-y-3">
        {champions.map((champ, index) => {
          const kdaColor = getKdaColor(champ.avgKda);
          const winRateColor = getWinRateColor(champ.winRate);

          return (
            <div
              key={index}
              className="bg-slate-900/50 rounded-lg p-3 hover:bg-slate-900/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* 챔피언 아바타 */}
                <ChampionAvatar
                  championName={champ.championName}
                  size="md"
                  shape="circle"
                  showTooltip
                />

                {/* 챔피언 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm truncate">
                    {champ.championName}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {champ.games}게임 •{' '}
                    <span style={{ color: winRateColor }}>
                      {champ.winRate.toFixed(1)}%
                    </span>{' '}
                    •{' '}
                    <span style={{ color: kdaColor }}>
                      {champ.avgKda.toFixed(2)}:1
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {champ.avgKills.toFixed(1)} / {champ.avgDeaths.toFixed(1)} /{' '}
                    {champ.avgAssists.toFixed(1)}
                  </div>
                </div>

                {/* 승/패 */}
                <div className="text-right">
                  <div className="text-xs text-gray-400">
                    <span className="text-blue-400">{champ.wins}</span>
                    W{' '}
                    <span className="text-red-400">{champ.losses}</span>
                    L
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { PlayerPositionStats } from '../api/types';
import { getPositionShort, getWinRateColor } from '../utils/statsCalculations';

interface PositionStatsCardProps {
  positions: PlayerPositionStats[];
}

export function PositionStatsCard({ positions }: PositionStatsCardProps) {
  if (positions.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">포지션별 통계</h3>
        <div className="text-center py-6 text-gray-500">
          포지션 기록이 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">포지션별 통계</h3>
      <div className="space-y-2">
        {positions.map((pos, index) => {
          const winRateColor = getWinRateColor(pos.winRate);

          return (
            <div
              key={index}
              className="flex items-center justify-between bg-slate-900/50 rounded p-3 hover:bg-slate-900/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-10">
                  {getPositionShort(pos.position)}
                </span>
                <span className="text-sm text-gray-300">
                  {pos.games}게임
                </span>
              </div>
              <div className="text-right">
                <span
                  className="text-sm font-semibold"
                  style={{ color: winRateColor }}
                >
                  {pos.winRate.toFixed(1)}%
                </span>
                <div className="text-xs text-gray-500 mt-0.5">
                  {pos.wins}승 {pos.games - pos.wins}패
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

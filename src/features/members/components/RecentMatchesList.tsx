import { PlayerMatchDetail } from '../api/types';
import { PlayerMatchAccordion } from './PlayerMatchAccordion';

interface RecentMatchesListProps {
  matches: PlayerMatchDetail[];
  playerId: string;
}

export function RecentMatchesList({ matches, playerId }: RecentMatchesListProps) {
  if (matches.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">최근 경기</h2>
        <div className="text-center py-12 text-gray-500">
          최근 경기 기록이 없습니다
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">최근 경기</h2>
      <div className="space-y-3">
        {matches.map((match, idx) => (
          <PlayerMatchAccordion
            key={match.game.id}
            match={match}
            playerId={playerId}
            defaultOpen={idx === 0}
          />
        ))}
      </div>
    </div>
  );
}

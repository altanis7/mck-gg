'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useMatchSeriesDetail } from '@/features/matches/hooks/useMatchSeriesDetail';
import { Button } from '@/shared/components/ui/Button';
import { Loading } from '@/shared/components/ui/Loading';
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage';
import { GameAccordionItem } from '@/features/matches/components/GameAccordionItem';

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: seriesDetail, isLoading, error } = useMatchSeriesDetail(id);
  const [openGames, setOpenGames] = useState<Set<string>>(new Set());

  const toggleGame = (gameId: string) => {
    setOpenGames((prev) => {
      const next = new Set(prev);
      if (next.has(gameId)) {
        next.delete(gameId);
      } else {
        next.add(gameId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  if (error || !seriesDetail) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error?.message || '시리즈를 찾을 수 없습니다'} />
      </div>
    );
  }

  const seriesTypeLabel =
    seriesDetail.series_type === 'bo1'
      ? '단판'
      : seriesDetail.series_type === 'bo3'
        ? '3판 2선승'
        : '5판 3선승';

  const statusLabel =
    seriesDetail.series_status === 'scheduled'
      ? '예정'
      : seriesDetail.series_status === 'ongoing'
        ? '진행중'
        : '완료';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/matches">
          <Button variant="outline">← 목록으로</Button>
        </Link>
      </div>

      {/* 시리즈 정보 */}
      <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg shadow backdrop-blur-sm mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">경기 상세</h1>
            <p className="text-gray-300">
              {new Date(seriesDetail.series_date).toLocaleString('ko-KR')}
            </p>
            <p className="text-lg font-semibold mt-2 text-white">{seriesTypeLabel}</p>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`px-3 py-1 rounded text-sm font-semibold ${
                seriesDetail.series_status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : seriesDetail.series_status === 'ongoing'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-slate-700/50 text-gray-200'
              }`}
            >
              {statusLabel}
            </div>
            {seriesDetail.series_status === 'completed' &&
              seriesDetail.winner_team && (
                <div
                  className={`px-4 py-2 rounded text-lg font-bold ${
                    seriesDetail.winner_team === 'blue'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {seriesDetail.blue_wins} - {seriesDetail.red_wins}{' '}
                  {seriesDetail.winner_team === 'blue' ? '블루팀' : '레드팀'}{' '}
                  승리
                </div>
              )}
          </div>
        </div>
        {seriesDetail.notes && (
          <p className="mt-4 p-4 bg-slate-900/50 rounded text-gray-200">{seriesDetail.notes}</p>
        )}
      </div>

      {/* 게임 아코디언 */}
      {seriesDetail.games.length > 0 && (
        <div className="space-y-3">
          {seriesDetail.games.map((game) => (
            <GameAccordionItem
              key={game.id}
              game={game}
              isOpen={openGames.has(game.id)}
              onToggle={() => toggleGame(game.id)}
            />
          ))}
        </div>
      )}

      {seriesDetail.games.length === 0 && (
        <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-lg">
          <p className="text-gray-300 mb-4">등록된 게임이 없습니다</p>
        </div>
      )}
    </div>
  );
}
'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useMatchSeriesDetail } from '@/features/matches/hooks/useMatchSeriesDetail';
import { Button } from '@/shared/components/ui/Button';
import { Loading } from '@/shared/components/ui/Loading';
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage';
import { GameDetail } from '@/features/matches/api/types';

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: seriesDetail, isLoading, error } = useMatchSeriesDetail(id);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);

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

  const selectedGame =
    seriesDetail.games.length > 0
      ? seriesDetail.games[selectedGameIndex]
      : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/admin/matches">
          <Button variant="outline">← 목록으로</Button>
        </Link>
      </div>

      {/* 시리즈 정보 */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">시리즈 상세</h1>
            <p className="text-gray-600">
              {new Date(seriesDetail.series_date).toLocaleString('ko-KR')}
            </p>
            <p className="text-lg font-semibold mt-2">{seriesTypeLabel}</p>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`px-3 py-1 rounded text-sm font-semibold ${
                seriesDetail.series_status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : seriesDetail.series_status === 'ongoing'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
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
          <p className="mt-4 p-4 bg-gray-50 rounded">{seriesDetail.notes}</p>
        )}
      </div>

      {/* 게임 탭 */}
      {seriesDetail.games.length > 0 && (
        <>
          <div className="flex gap-2 mb-6">
            {seriesDetail.games.map((game, index) => (
              <button
                key={game.id}
                onClick={() => setSelectedGameIndex(index)}
                className={`px-4 py-2 rounded font-semibold transition-colors ${
                  selectedGameIndex === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {game.game_number}게임
                {game.winning_team && (
                  <span className="ml-2 text-xs">
                    ({game.winning_team === 'blue' ? '블루' : '레드'} 승)
                  </span>
                )}
              </button>
            ))}
          </div>

          {selectedGame && (
            <GameResultsDisplay game={selectedGame} />
          )}
        </>
      )}

      {seriesDetail.games.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">등록된 게임이 없습니다</p>
        </div>
      )}
    </div>
  );
}

function GameResultsDisplay({ game }: { game: GameDetail }) {
  const blueTeam = game.game_results.filter((r) => r.team === 'blue');
  const redTeam = game.game_results.filter((r) => r.team === 'red');

  const calculateKDA = (kills: number, deaths: number, assists: number) => {
    if (deaths === 0) return ((kills + assists) / 1).toFixed(2);
    return ((kills + assists) / deaths).toFixed(2);
  };

  return (
    <div>
      {/* 게임 정보 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              게임 상태:{' '}
              {game.game_status === 'completed'
                ? '완료'
                : game.game_status === 'in_progress'
                  ? '진행중'
                  : '시작 전'}
            </p>
            {game.duration && (
              <p className="text-sm text-gray-600">
                경기 시간: {Math.floor(game.duration / 60)}분{' '}
                {game.duration % 60}초
              </p>
            )}
          </div>
          {game.winning_team && (
            <div
              className={`px-4 py-2 rounded font-bold ${
                game.winning_team === 'blue'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {game.winning_team === 'blue' ? '블루팀' : '레드팀'} 승리
            </div>
          )}
        </div>
        {game.notes && (
          <p className="mt-2 p-3 bg-gray-50 rounded text-sm">{game.notes}</p>
        )}
      </div>

      {/* 블루팀 결과 */}
      <div className="bg-blue-50 p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4 text-blue-700">블루팀</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2 text-left">포지션</th>
                <th className="px-4 py-2 text-left">챔피언</th>
                <th className="px-4 py-2 text-center">K</th>
                <th className="px-4 py-2 text-center">D</th>
                <th className="px-4 py-2 text-center">A</th>
                <th className="px-4 py-2 text-center">KDA</th>
                <th className="px-4 py-2 text-center">CS</th>
                <th className="px-4 py-2 text-right">피해량</th>
                <th className="px-4 py-2 text-right">골드</th>
              </tr>
            </thead>
            <tbody>
              {blueTeam.map((result) => (
                <tr key={result.id} className="border-t">
                  <td className="px-4 py-2 capitalize">{result.position}</td>
                  <td className="px-4 py-2 font-semibold">
                    {result.champion_name}
                  </td>
                  <td className="px-4 py-2 text-center">{result.kills}</td>
                  <td className="px-4 py-2 text-center">{result.deaths}</td>
                  <td className="px-4 py-2 text-center">{result.assists}</td>
                  <td className="px-4 py-2 text-center font-semibold">
                    {calculateKDA(result.kills, result.deaths, result.assists)}
                  </td>
                  <td className="px-4 py-2 text-center">{result.cs}</td>
                  <td className="px-4 py-2 text-right">
                    {result.champion_damage.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {result.gold_earned.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 레드팀 결과 */}
      <div className="bg-red-50 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-red-700">레드팀</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded">
            <thead className="bg-red-100">
              <tr>
                <th className="px-4 py-2 text-left">포지션</th>
                <th className="px-4 py-2 text-left">챔피언</th>
                <th className="px-4 py-2 text-center">K</th>
                <th className="px-4 py-2 text-center">D</th>
                <th className="px-4 py-2 text-center">A</th>
                <th className="px-4 py-2 text-center">KDA</th>
                <th className="px-4 py-2 text-center">CS</th>
                <th className="px-4 py-2 text-right">피해량</th>
                <th className="px-4 py-2 text-right">골드</th>
              </tr>
            </thead>
            <tbody>
              {redTeam.map((result) => (
                <tr key={result.id} className="border-t">
                  <td className="px-4 py-2 capitalize">{result.position}</td>
                  <td className="px-4 py-2 font-semibold">
                    {result.champion_name}
                  </td>
                  <td className="px-4 py-2 text-center">{result.kills}</td>
                  <td className="px-4 py-2 text-center">{result.deaths}</td>
                  <td className="px-4 py-2 text-center">{result.assists}</td>
                  <td className="px-4 py-2 text-center font-semibold">
                    {calculateKDA(result.kills, result.deaths, result.assists)}
                  </td>
                  <td className="px-4 py-2 text-center">{result.cs}</td>
                  <td className="px-4 py-2 text-right">
                    {result.champion_damage.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {result.gold_earned.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

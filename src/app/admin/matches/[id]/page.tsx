'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useMatchSeriesDetail } from '@/features/matches/hooks/useMatchSeriesDetail';
import { useDeleteGame } from '@/features/matches/hooks/useDeleteGame';
import { useDeleteSeries } from '@/features/matches/hooks/useDeleteSeries';
import { GameRegistrationForm } from '@/features/matches/components/GameRegistrationForm';
import { DeleteGameModal } from '@/features/matches/components/DeleteGameModal';
import { DeleteSeriesModal } from '@/features/matches/components/DeleteSeriesModal';
import { Button } from '@/shared/components/ui/Button';
import { Loading } from '@/shared/components/ui/Loading';
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage';
import { ChampionAvatar } from '@/shared/components/ui/ChampionAvatar';
import { ChampionBanList } from '@/features/matches/components/ChampionBanList';
import { GameDetail } from '@/features/matches/api/types';

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: seriesDetail, isLoading, error, refetch } = useMatchSeriesDetail(id);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const [showDeleteSeriesModal, setShowDeleteSeriesModal] = useState(false);
  const deleteGameMutation = useDeleteGame(id);
  const deleteSeriesMutation = useDeleteSeries();

  const handleDeleteGame = async () => {
    if (!gameToDelete) return;

    try {
      await deleteGameMutation.mutateAsync(gameToDelete);
      setGameToDelete(null);
      // 삭제된 게임이 현재 선택된 게임이면 첫 번째 게임으로 이동
      if (seriesDetail && selectedGameIndex >= seriesDetail.games.length - 1) {
        setSelectedGameIndex(Math.max(0, seriesDetail.games.length - 2));
      }
    } catch (error) {
      console.error('게임 삭제 실패:', error);
    }
  };

  const handleDeleteSeries = async () => {
    try {
      await deleteSeriesMutation.mutateAsync(id);
      // useDeleteSeries에서 자동으로 리다이렉트됨
    } catch (error) {
      console.error('시리즈 삭제 실패:', error);
      setShowDeleteSeriesModal(false);
    }
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
            <Button
              variant="danger"
              onClick={() => setShowDeleteSeriesModal(true)}
            >
              시리즈 삭제
            </Button>
          </div>
        </div>
        {seriesDetail.notes && (
          <p className="mt-4 p-4 bg-gray-50 rounded">{seriesDetail.notes}</p>
        )}
      </div>

      {/* 게임 추가 버튼 */}
      {seriesDetail.series_status !== 'completed' && (
        <div className="mb-6">
          <Button
            onClick={() => setIsAddingGame(true)}
            disabled={isAddingGame}
          >
            + 게임 추가
          </Button>
        </div>
      )}

      {/* 게임 추가 폼 */}
      {isAddingGame && (
        <div className="mb-6">
          <GameRegistrationForm
            seriesId={id}
            gameNumber={seriesDetail.games.length + 1}
            onSuccess={() => {
              setIsAddingGame(false);
              refetch();
            }}
            onCancel={() => setIsAddingGame(false)}
          />
        </div>
      )}

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
            <GameResultsDisplay
              game={selectedGame}
              onDeleteClick={() => setGameToDelete(selectedGame.id)}
            />
          )}
        </>
      )}

      {/* 게임 삭제 확인 모달 */}
      {gameToDelete && (
        <DeleteGameModal
          isOpen={!!gameToDelete}
          onClose={() => setGameToDelete(null)}
          onConfirm={handleDeleteGame}
          gameNumber={
            seriesDetail.games.find((g) => g.id === gameToDelete)?.game_number ||
            0
          }
          isDeleting={deleteGameMutation.isPending}
        />
      )}

      {seriesDetail.games.length === 0 && !isAddingGame && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">등록된 게임이 없습니다</p>
          <p className="text-sm text-gray-400">
            위의 "게임 추가" 버튼을 클릭하여 첫 게임을 등록하세요
          </p>
        </div>
      )}

      {/* 시리즈 삭제 확인 모달 */}
      {showDeleteSeriesModal && (
        <DeleteSeriesModal
          isOpen={showDeleteSeriesModal}
          onClose={() => setShowDeleteSeriesModal(false)}
          onConfirm={handleDeleteSeries}
          seriesDate={seriesDetail.series_date}
          seriesType={
            seriesDetail.series_type === 'bo3'
              ? '3판 2선승'
              : seriesDetail.series_type === 'bo5'
                ? '5판 3선승'
                : '단판'
          }
          gameCount={seriesDetail.games.length}
          isDeleting={deleteSeriesMutation.isPending}
        />
      )}
    </div>
  );
}

function GameResultsDisplay({
  game,
  onDeleteClick,
}: {
  game: GameDetail;
  onDeleteClick: () => void;
}) {
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

  // Helper functions for OP.GG style
  const getTeamMaxDamage = (team: typeof blueTeam) => {
    return Math.max(...team.map((p) => p.champion_damage), 1);
  };

  const getCSPerMin = (cs: number, duration: number | null | undefined) => {
    if (!duration) return '0.0';
    return (cs / (duration / 60)).toFixed(1);
  };

  const blueBgColor = game.winning_team === 'blue' ? 'bg-blue-50' : 'bg-blue-50/40';
  const redBgColor = game.winning_team === 'red' ? 'bg-red-50' : 'bg-red-50/40';

  return (
    <div className="space-y-4">
      {/* 게임 정보 헤더 - OP.GG 스타일 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
              <span className="text-sm text-gray-600">
                {Math.floor(game.duration / 60)}분 {game.duration % 60}초
              </span>
            )}
            <span className="text-xs text-gray-400">
              {game.game_number}게임
            </span>
          </div>
          <Button variant="danger" size="sm" onClick={onDeleteClick}>
            삭제
          </Button>
        </div>
        {game.notes && (
          <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {game.notes}
          </p>
        )}
      </div>

      {/* 밴픽 정보 - OP.GG 스타일 */}
      {game.ban_picks && game.ban_picks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
        <h3 className="text-sm font-bold mb-3 text-blue-700 uppercase">블루팀</h3>
        <div className="space-y-1">
          {blueTeam.map((result) => {
            const maxDamage = getTeamMaxDamage(blueTeam);
            const damagePercent = (result.champion_damage / maxDamage) * 100;
            const csPerMin = getCSPerMin(result.cs, game.duration);
            const kda = calculateKDA(result.kills, result.deaths, result.assists);

            return (
              <div
                key={result.id}
                className="bg-white rounded-lg p-3 flex items-center gap-3 hover:shadow-md transition-shadow"
              >
                {/* 챔피언 아바타 */}
                <ChampionAvatar
                  championName={result.champion_name}
                  size="lg"
                  shape="circle"
                  showTooltip
                />

                {/* 포지션 */}
                <div className="w-12">
                  <span className="text-xs font-semibold text-gray-600 uppercase">
                    {result.position}
                  </span>
                </div>

                {/* 플레이어 정보 */}
                <div className="w-32">
                  <div className="font-semibold text-sm text-gray-900">
                    {result.members?.name || '-'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.members?.summoner_name || ''}
                  </div>
                </div>

                {/* KDA */}
                <div className="flex items-center gap-2 w-40">
                  <span className="font-bold text-gray-900">
                    {result.kills} / {result.deaths} / {result.assists}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                    {kda}
                  </span>
                </div>

                {/* CS */}
                <div className="text-center w-24">
                  <div className="font-semibold text-sm text-gray-900">{result.cs}</div>
                  <div className="text-xs text-gray-500">{csPerMin} /분</div>
                </div>

                {/* 피해량 진행바 */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">피해량</span>
                    <span className="font-semibold text-gray-900">
                      {result.champion_damage.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${damagePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 레드팀 결과 - OP.GG 스타일 */}
      <div className={`rounded-lg p-4 ${redBgColor}`}>
        <h3 className="text-sm font-bold mb-3 text-red-700 uppercase">레드팀</h3>
        <div className="space-y-1">
          {redTeam.map((result) => {
            const maxDamage = getTeamMaxDamage(redTeam);
            const damagePercent = (result.champion_damage / maxDamage) * 100;
            const csPerMin = getCSPerMin(result.cs, game.duration);
            const kda = calculateKDA(result.kills, result.deaths, result.assists);

            return (
              <div
                key={result.id}
                className="bg-white rounded-lg p-3 flex items-center gap-3 hover:shadow-md transition-shadow"
              >
                {/* 챔피언 아바타 */}
                <ChampionAvatar
                  championName={result.champion_name}
                  size="lg"
                  shape="circle"
                  showTooltip
                />

                {/* 포지션 */}
                <div className="w-12">
                  <span className="text-xs font-semibold text-gray-600 uppercase">
                    {result.position}
                  </span>
                </div>

                {/* 플레이어 정보 */}
                <div className="w-32">
                  <div className="font-semibold text-sm text-gray-900">
                    {result.members?.name || '-'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.members?.summoner_name || ''}
                  </div>
                </div>

                {/* KDA */}
                <div className="flex items-center gap-2 w-40">
                  <span className="font-bold text-gray-900">
                    {result.kills} / {result.deaths} / {result.assists}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                    {kda}
                  </span>
                </div>

                {/* CS */}
                <div className="text-center w-24">
                  <div className="font-semibold text-sm text-gray-900">{result.cs}</div>
                  <div className="text-xs text-gray-500">{csPerMin} /분</div>
                </div>

                {/* 피해량 진행바 */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">피해량</span>
                    <span className="font-semibold text-gray-900">
                      {result.champion_damage.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${damagePercent}%` }}
                    />
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

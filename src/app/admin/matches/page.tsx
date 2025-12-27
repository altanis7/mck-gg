'use client';

import Link from 'next/link';
import { useMatchSeries } from '@/features/matches/hooks/useMatchSeries';
import { Button } from '@/shared/components/ui/Button';
import { Loading } from '@/shared/components/ui/Loading';
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage';

export default function MatchesPage() {
  const { data: series, isLoading, error } = useMatchSeries();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error.message} />
      </div>
    );
  }

  if (!series) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">경기 관리</h1>
        <Link href="/admin/matches/new">
          <Button>경기 등록</Button>
        </Link>
      </div>

      {series.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">등록된 시리즈가 없습니다</p>
          <Link href="/admin/matches/new">
            <Button>첫 시리즈 등록하기</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {series.map((s) => {
            const seriesTypeLabel =
              s.series_type === 'bo1'
                ? '단판'
                : s.series_type === 'bo3'
                  ? '3판 2선승'
                  : '5판 3선승';

            const statusLabel =
              s.series_status === 'scheduled'
                ? '예정'
                : s.series_status === 'ongoing'
                  ? '진행중'
                  : '완료';

            return (
              <Link
                key={s.id}
                href={`/admin/matches/${s.id}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(s.series_date).toLocaleString('ko-KR')}
                    </p>
                    <p className="text-lg font-semibold mt-1">
                      {seriesTypeLabel}
                    </p>
                    {s.series_status === 'completed' && s.winner_team && (
                      <p className="text-sm mt-1">
                        {s.blue_wins} - {s.red_wins}
                        <span
                          className={`ml-2 ${
                            s.winner_team === 'blue'
                              ? 'text-blue-600'
                              : 'text-red-600'
                          }`}
                        >
                          ({s.winner_team === 'blue' ? '블루팀' : '레드팀'} 승리)
                        </span>
                      </p>
                    )}
                  </div>
                  <div
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      s.series_status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : s.series_status === 'ongoing'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {statusLabel}
                  </div>
                </div>
                {s.notes && (
                  <p className="text-gray-600 mt-2 text-sm">{s.notes}</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

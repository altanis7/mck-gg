'use client';

import { useState } from 'react';
import { useCreateMatchSeries } from '../hooks/useCreateMatchSeries';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage';

export function SeriesCreationForm() {
  const createSeriesMutation = useCreateMatchSeries();

  const [seriesDate, setSeriesDate] = useState('');
  const [seriesTime, setSeriesTime] = useState('');
  const [seriesType, setSeriesType] = useState<'bo3' | 'bo5'>('bo3');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    if (!seriesDate || !seriesTime) {
      setError('날짜와 시간을 모두 입력해주세요');
      return;
    }

    // 날짜+시간 결합하여 ISO 문자열 생성
    const seriesDateTime = new Date(`${seriesDate}T${seriesTime}`);
    if (isNaN(seriesDateTime.getTime())) {
      setError('올바른 날짜와 시간을 입력해주세요');
      return;
    }

    try {
      await createSeriesMutation.mutateAsync({
        series_date: seriesDateTime.toISOString(),
        series_type: seriesType,
        notes: notes || undefined,
      });
      // useCreateMatchSeries hook의 onSuccess에서 자동으로 리다이렉트됨
    } catch (err) {
      setError(err instanceof Error ? err.message : '시리즈 생성 실패');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6">새 시리즈 생성</h2>

        {error && <ErrorMessage message={error} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 날짜/시간 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                날짜
              </label>
              <Input
                type="date"
                value={seriesDate}
                onChange={(e) => setSeriesDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                시간
              </label>
              <Input
                type="time"
                value={seriesTime}
                onChange={(e) => setSeriesTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 시리즈 타입 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              시리즈 형식
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="bo3"
                  checked={seriesType === 'bo3'}
                  onChange={(e) => setSeriesType(e.target.value as 'bo3')}
                  className="mr-2"
                />
                <span className="text-sm text-white">3판 2선승 (BO3)</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="bo5"
                  checked={seriesType === 'bo5'}
                  onChange={(e) => setSeriesType(e.target.value as 'bo5')}
                  className="mr-2"
                />
                <span className="text-sm text-white">5판 3선승 (BO5)</span>
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              시리즈 생성 후 각 게임을 개별적으로 추가할 수 있습니다
            </p>
          </div>

          {/* 메모 */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              메모 (선택)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 정규 시즌 1차, 플레이오프 결승 등"
            />
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={createSeriesMutation.isPending}
            >
              {createSeriesMutation.isPending
                ? '생성 중...'
                : '시리즈 생성'}
            </Button>
          </div>
        </form>
      </div>

      {/* 안내 메시지 */}
      <div className="mt-6 p-4 bg-slate-800 border border-slate-700 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">
          📌 시리즈 생성 후 절차
        </h3>
        <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
          <li>시리즈 생성 후 자동으로 상세 페이지로 이동합니다</li>
          <li>상세 페이지에서 "게임 추가" 버튼을 클릭하세요</li>
          <li>각 게임의 밴픽(선택)과 플레이어 통계를 입력하세요</li>
          <li>
            승부가 결정될 때까지 반복하세요 (BO3: 2승, BO5: 3승)
          </li>
        </ol>
      </div>
    </div>
  );
}
